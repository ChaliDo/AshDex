(() => {
  'use strict';

  const root = document.querySelector('#app');

  if (!root) {
    console.error('AshDex: #app element was not found.');
    return;
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]);
  }

  function getErrorText(error) {
    if (!error) {
      return 'Unknown error.';
    }

    const code = error.code ? `${error.code}: ` : '';
    const message = error.message || String(error);

    return `${code}${message}`;
  }

  function showFatalError(title, detail = '') {
    console.error(title, detail);

    root.innerHTML = `
      <main class="login">
        <img
          src="assets/ash-pikachu-transparent.png"
          alt="Ash and Pikachu"
        >

        <h1>AshDex</h1>
        <p>${escapeHtml(title)}</p>

        ${
          detail
            ? `<small class="status-message">${escapeHtml(detail)}</small>`
            : ''
        }

        <button id="fatal-retry-button" type="button">
          Try again
        </button>
      </main>
    `;

    document
      .querySelector('#fatal-retry-button')
      ?.addEventListener('click', () => window.location.reload());
  }

  window.addEventListener('error', (event) => {
    showFatalError(
      'A JavaScript error occurred.',
      event.message || 'Unknown JavaScript error.'
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    showFatalError(
      'AshDex could not finish starting.',
      getErrorText(event.reason)
    );
  });

  if (!window.firebase) {
    showFatalError(
      'Firebase libraries could not be loaded.',
      'Check your internet connection and try again.'
    );
    return;
  }

  if (!Array.isArray(window.POKEMON) || !Array.isArray(window.REGIONS)) {
    showFatalError(
      'Pokémon data could not be loaded.',
      'The data.js file may be missing or invalid.'
    );
    return;
  }

  const firebaseConfig = {
    apiKey: 'AIzaSyCrjjAQcSA9xI5x9iiqhoi45AT5afhyKJs',
    authDomain: 'ashdex-chalido.firebaseapp.com',
    projectId: 'ashdex-chalido',
    storageBucket: 'ashdex-chalido.firebasestorage.app',
    messagingSenderId: '753341960916',
    appId: '1:753341960916:web:49d3a9b509c026f2f7a141',
    measurementId: 'G-WX6BR0F2T6',
  };

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  } catch (error) {
    showFatalError(
      'Firebase could not be initialized.',
      getErrorText(error)
    );
    return;
  }

  const auth = firebase.auth();
  const db = firebase.firestore();
  const provider = new firebase.auth.GoogleAuthProvider();

  /*
   * Firestore bağlantısını bazı mobil ağlar, güvenlik yazılımları,
   * VPN'ler ve kısıtlayıcı bağlantılarla daha uyumlu hâle getirir.
   *
   * Bu ayar herhangi bir Firestore okuma/yazma işleminden önce yapılmalıdır.
   */
  try {
    db.settings({
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    });
  } catch (error) {
    console.warn(
      'Firestore transport settings could not be applied:',
      error
    );
  }

  provider.setCustomParameters({
    prompt: 'select_account',
  });

  let currentUser = null;
  let profile = null;
  let unsubscribeProfile = null;

  let selectedRegion = 'All';
  let searchQuery = '';
  let selectedFriend = null;
  let statusMessage = '';
  let startupFinished = false;

  function createEmptyOwned() {
    return Object.fromEntries(
      window.POKEMON.map((pokemon) => [pokemon.id, false])
    );
  }

  function trainerCodeFromUid(uid) {
    const cleanUid = uid
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 6)
      .toUpperCase();

    return `ASH-${cleanUid}`;
  }

  function countOwned(owned = {}) {
    return window.POKEMON.reduce(
      (total, pokemon) => total + (owned[pokemon.id] ? 1 : 0),
      0
    );
  }

  async function ensureUserDocument(user) {
    const userRef = db.collection('users').doc(user.uid);
    const snapshot = await userRef.get();

    if (snapshot.exists) {
      const currentData = snapshot.data() || {};

      const mergedOwned = {
        ...createEmptyOwned(),
        ...(currentData.owned || {}),
      };

      const trainerCode =
        currentData.trainerCode || trainerCodeFromUid(user.uid);

      const updatedProfile = {
        uid: user.uid,
        displayName:
          currentData.displayName ||
          user.displayName ||
          'Trainer',

        photoURL:
          currentData.photoURL ||
          user.photoURL ||
          '',

        email:
          user.email ||
          currentData.email ||
          '',

        trainerCode,
        owned: mergedOwned,

        friends: Array.isArray(currentData.friends)
          ? currentData.friends
          : [],

        updatedAt:
          firebase.firestore.FieldValue.serverTimestamp(),
      };

      await userRef.set(updatedProfile, {
        merge: true,
      });

      await db
        .collection('publicProfiles')
        .doc(trainerCode)
        .set(
          {
            uid: user.uid,
            displayName: updatedProfile.displayName,
            photoURL: updatedProfile.photoURL,
            trainerCode,
            owned: mergedOwned,
            updatedAt:
              firebase.firestore.FieldValue.serverTimestamp(),
          },
          {
            merge: true,
          }
        );

      return;
    }

    const trainerCode = trainerCodeFromUid(user.uid);

    const newProfile = {
      uid: user.uid,
      displayName: user.displayName || 'Trainer',
      photoURL: user.photoURL || '',
      email: user.email || '',
      trainerCode,
      owned: createEmptyOwned(),
      friends: [],

      createdAt:
        firebase.firestore.FieldValue.serverTimestamp(),

      updatedAt:
        firebase.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.set(newProfile);

    await db
      .collection('publicProfiles')
      .doc(trainerCode)
      .set({
        uid: user.uid,
        displayName: newProfile.displayName,
        photoURL: newProfile.photoURL,
        trainerCode,
        owned: newProfile.owned,

        updatedAt:
          firebase.firestore.FieldValue.serverTimestamp(),
      });
  }

  function renderLogin() {
    root.innerHTML = `
      <main class="login">
        <img
          src="assets/ash-pikachu-transparent.png"
          alt="Ash and Pikachu"
        >

        <h1>AshDex</h1>

        <p>
          Cloud-synced collection and live friend lookup.
        </p>

        <button id="login-button" type="button">
          Continue with Google
        </button>

        ${
          statusMessage
            ? `
              <small class="status-message">
                ${escapeHtml(statusMessage)}
              </small>
            `
            : ''
        }
      </main>
    `;

    document
      .querySelector('#login-button')
      ?.addEventListener('click', loginWithGoogle);
  }

  function renderLoading() {
    root.innerHTML = `
      <main class="login">
        <img
          src="assets/ash-pikachu-transparent.png"
          alt="Ash and Pikachu"
        >

        <h1>AshDex</h1>
        <p>Opening your Trainer Card…</p>

        ${
          statusMessage
            ? `
              <small class="status-message">
                ${escapeHtml(statusMessage)}
              </small>

              <button id="retry-button" type="button">
                Try again
              </button>

              <button id="signout-retry-button" class="ghost" type="button">
                Sign out
              </button>
            `
            : ''
        }
      </main>
    `;

    document
      .querySelector('#retry-button')
      ?.addEventListener('click', () => window.location.reload());

    document
      .querySelector('#signout-retry-button')
      ?.addEventListener('click', async () => {
        try {
          await auth.signOut();
        } catch (error) {
          statusMessage = getErrorText(error);
          render();
        }
      });
  }

  function pokemonCardHtml(pokemon, isOwned) {
    const label = pokemon.kind || pokemon.note || '';

    return `
      <article
        class="card ${isOwned ? 'owned' : ''}"
        data-pokemon-id="${escapeHtml(pokemon.id)}"
        tabindex="0"
        role="button"
        aria-pressed="${isOwned ? 'true' : 'false'}"
      >
        <div class="check">
          ${isOwned ? '✓' : ''}
        </div>

        <img
          src="assets/pokemon/${encodeURI(pokemon.image)}"
          alt="${escapeHtml(pokemon.name)}"
          loading="lazy"
        >

        <small>
          #${escapeHtml(pokemon.dex)}
          ·
          ${escapeHtml(pokemon.region)}
        </small>

        <h3>${escapeHtml(pokemon.name)}</h3>

        ${
          label
            ? `<span>${escapeHtml(label)}</span>`
            : ''
        }
      </article>
    `;
  }

  function friendHtml(friendProfile) {
    const friendOwned = friendProfile.owned || {};
    const ownedCount = countOwned(friendOwned);

    const percentage = Math.round(
      (ownedCount / window.POKEMON.length) * 100
    );

    return `
      <div class="friendCard">
        <img
          src="${escapeHtml(
            friendProfile.photoURL || 'assets/icon-192.png'
          )}"
          alt="${escapeHtml(
            friendProfile.displayName || 'Trainer'
          )}"
        >

        <div>
          <b>
            ${escapeHtml(
              friendProfile.displayName || 'Trainer'
            )}
          </b>

          <span>
            ${ownedCount}/${window.POKEMON.length}
            ·
            ${percentage}%
          </span>
        </div>
      </div>
    `;
  }

  function renderApp() {
    const owned = {
      ...createEmptyOwned(),
      ...(profile.owned || {}),
    };

    const ownedCount = countOwned(owned);

    const percentage = Math.round(
      (ownedCount / window.POKEMON.length) * 100
    );

    const normalizedSearch = searchQuery
      .trim()
      .toLocaleLowerCase('en');

    const filteredPokemon = window.POKEMON.filter((pokemon) => {
      const matchesRegion =
        selectedRegion === 'All' ||
        pokemon.region === selectedRegion;

      const matchesSearch = pokemon.name
        .toLocaleLowerCase('en')
        .includes(normalizedSearch);

      return matchesRegion && matchesSearch;
    });

    root.innerHTML = `
      <div class="app">
        <header>
          <div>
            <h1>AshDex</h1>

            <p>
              ${ownedCount}/${window.POKEMON.length}
              collected ·
              ${percentage}%
            </p>
          </div>

          <button
            id="logout-button"
            class="ghost"
            type="button"
          >
            Sign out
          </button>
        </header>

        <section class="trainer">
          <img
            src="${escapeHtml(
              profile.photoURL || 'assets/icon-192.png'
            )}"
            alt="${escapeHtml(
              profile.displayName || 'Trainer'
            )}"
          >

          <div>
            <b>
              ${escapeHtml(
                profile.displayName || 'Trainer'
              )}
            </b>

            <span>
              Trainer Code:
              <strong>
                ${escapeHtml(
                  profile.trainerCode || ''
                )}
              </strong>
            </span>
          </div>
        </section>

        <section class="friends">
          <h2>Live Friend Lookup</h2>

          <div class="friendAdd">
            <input
              id="friend-code-input"
              type="text"
              placeholder="ASH-ABC123"
              autocomplete="off"
              autocapitalize="characters"
            >

            <button
              id="find-friend-button"
              type="button"
            >
              Check
            </button>
          </div>

          ${
            statusMessage
              ? `
                <p class="status-message">
                  ${escapeHtml(statusMessage)}
                </p>
              `
              : ''
          }

          ${
            selectedFriend
              ? friendHtml(selectedFriend)
              : ''
          }
        </section>

        <nav class="regions">
          ${window.REGIONS.map((regionName) => `
            <button
              type="button"
              data-region="${escapeHtml(regionName)}"
              class="${
                regionName === selectedRegion
                  ? 'active'
                  : ''
              }"
            >
              ${escapeHtml(regionName)}
            </button>
          `).join('')}
        </nav>

        <input
          id="pokemon-search"
          class="search"
          type="search"
          value="${escapeHtml(searchQuery)}"
          placeholder="Search Pokémon…"
        >

        <main class="grid">
          ${
            filteredPokemon.length
              ? filteredPokemon
                  .map((pokemon) =>
                    pokemonCardHtml(
                      pokemon,
                      Boolean(owned[pokemon.id])
                    )
                  )
                  .join('')
              : `
                <p class="empty-message">
                  No Pokémon found.
                </p>
              `
          }
        </main>
      </div>
    `;

    bindAppEvents();
  }

  function render() {
    if (!startupFinished) {
      renderLoading();
      return;
    }

    if (!currentUser) {
      renderLogin();
      return;
    }

    if (!profile) {
      renderLoading();
      return;
    }

    renderApp();
  }

  function bindAppEvents() {
    document
      .querySelector('#logout-button')
      ?.addEventListener('click', async () => {
        statusMessage = '';

        try {
          await auth.signOut();
        } catch (error) {
          statusMessage = getErrorText(error);
          render();
        }
      });

    document
      .querySelector('#pokemon-search')
      ?.addEventListener('input', (event) => {
        searchQuery = event.target.value;
        render();
      });

    document
      .querySelectorAll('[data-region]')
      .forEach((button) => {
        button.addEventListener('click', () => {
          selectedRegion = button.dataset.region;
          render();
        });
      });

    document
      .querySelectorAll('[data-pokemon-id]')
      .forEach((card) => {
        const toggleCard = () => {
          togglePokemon(card.dataset.pokemonId);
        };

        card.addEventListener('click', toggleCard);

        card.addEventListener('keydown', (event) => {
          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            toggleCard();
          }
        });
      });

    document
      .querySelector('#find-friend-button')
      ?.addEventListener('click', () => {
        const value =
          document.querySelector('#friend-code-input')
            ?.value || '';

        findFriend(value);
      });

    document
      .querySelector('#friend-code-input')
      ?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();

          findFriend(event.target.value);
        }
      });
  }

  async function loginWithGoogle() {
    statusMessage = '';
    render();

    try {
      await auth.signInWithPopup(provider);
    } catch (error) {
      const redirectErrors = [
        'auth/popup-blocked',
        'auth/cancelled-popup-request',
        'auth/operation-not-supported-in-this-environment',
      ];

      if (redirectErrors.includes(error.code)) {
        try {
          await auth.signInWithRedirect(provider);
        } catch (redirectError) {
          statusMessage = getErrorText(redirectError);
          startupFinished = true;
          render();
        }

        return;
      }

      statusMessage = getErrorText(error);
      startupFinished = true;
      render();
    }
  }

  async function togglePokemon(pokemonId) {
    if (!currentUser || !profile) {
      return;
    }

    const owned = {
      ...createEmptyOwned(),
      ...(profile.owned || {}),
    };

    const nextOwned = {
      ...owned,
      [pokemonId]: !owned[pokemonId],
    };

    const previousProfile = profile;

    profile = {
      ...profile,
      owned: nextOwned,
    };

    statusMessage = '';
    render();

    try {
      const userRef = db
        .collection('users')
        .doc(currentUser.uid);

      await userRef.update({
        owned: nextOwned,

        updatedAt:
          firebase.firestore.FieldValue.serverTimestamp(),
      });

      if (profile.trainerCode) {
        await db
          .collection('publicProfiles')
          .doc(profile.trainerCode)
          .set(
            {
              uid: currentUser.uid,
              displayName:
                profile.displayName || 'Trainer',

              photoURL:
                profile.photoURL || '',

              trainerCode:
                profile.trainerCode,

              owned: nextOwned,

              updatedAt:
                firebase.firestore.FieldValue.serverTimestamp(),
            },
            {
              merge: true,
            }
          );
      }
    } catch (error) {
      console.error(
        'Could not update Pokémon:',
        error
      );

      profile = previousProfile;
      statusMessage = getErrorText(error);
      render();
    }
  }

  async function findFriend(rawCode) {
    const trainerCode = rawCode
      .trim()
      .toUpperCase();

    statusMessage = '';
    selectedFriend = null;
    render();

    if (!trainerCode) {
      statusMessage = 'Enter a Trainer Code.';
      render();
      return;
    }

    if (
      profile?.trainerCode &&
      trainerCode === profile.trainerCode
    ) {
      statusMessage =
        'That is your own Trainer Code.';
      render();
      return;
    }

    try {
      const snapshot = await db
        .collection('publicProfiles')
        .doc(trainerCode)
        .get();

      if (!snapshot.exists) {
        statusMessage =
          'Trainer code not found.';

        render();
        return;
      }

      selectedFriend = snapshot.data();

      await db
        .collection('users')
        .doc(currentUser.uid)
        .update({
          friends:
            firebase.firestore.FieldValue.arrayUnion(
              trainerCode
            ),

          updatedAt:
            firebase.firestore.FieldValue.serverTimestamp(),
        });

      render();
    } catch (error) {
      console.error(
        'Friend lookup failed:',
        error
      );

      statusMessage = getErrorText(error);
      render();
    }
  }

  async function startProfileListener(user) {
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }

    await ensureUserDocument(user);

    unsubscribeProfile = db
      .collection('users')
      .doc(user.uid)
      .onSnapshot(
        {
          includeMetadataChanges: true,
        },

        (snapshot) => {
          if (!snapshot.exists) {
            profile = null;
            startupFinished = true;

            statusMessage =
              'Trainer profile document was not created.';

            render();
            return;
          }

          profile = snapshot.data();
          startupFinished = true;

          /*
           * Önbellekten gelen belge de uygulamayı açabilir.
           * Sunucuyla bağlantı kurulunca dinleyici tekrar çalışır.
           */
          statusMessage =
            snapshot.metadata.fromCache &&
            !navigator.onLine
              ? 'Offline mode'
              : '';

          render();
        },

        (error) => {
          console.error(
            'Profile listener error:',
            error
          );

          profile = null;
          startupFinished = true;
          statusMessage = getErrorText(error);
          render();
        }
      );
  }

  auth
    .getRedirectResult()
    .catch((error) => {
      console.error(
        'Redirect sign-in error:',
        error
      );

      statusMessage = getErrorText(error);
    });

  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    profile = null;
    selectedFriend = null;
    statusMessage = '';

    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }

    if (!user) {
      startupFinished = true;
      render();
      return;
    }

    startupFinished = false;
    render();

    try {
      await startProfileListener(user);
    } catch (error) {
      console.error(
        'AshDex startup error:',
        error
      );

      profile = null;
      startupFinished = true;
      statusMessage = getErrorText(error);
      render();
    }
  });
})();
