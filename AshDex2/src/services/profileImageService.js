const CLOUD_NAME = "sukds2rd";

const UPLOAD_PRESET =
  "ashdex_profile_images";

const MAX_FILE_SIZE =
  3 * 1024 * 1024;

export async function uploadProfileImage(
  uid,
  imageBlob
) {
  if (!uid) {
    throw new Error(
      "User ID is required."
    );
  }

  if (!imageBlob) {
    throw new Error(
      "Image is required."
    );
  }

  if (
    imageBlob.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      "Profile image must be smaller than 3 MB."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "file",
    imageBlob,
    "profile.webp"
  );

  formData.append(
    "upload_preset",
    UPLOAD_PRESET
  );

  formData.append(
    "folder",
    `ashdex/profile-images/${uid}`
  );

  const response =
    await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        "Image upload failed."
    );
  }

  return {
    url: result.secure_url,
    publicId:
      result.public_id,
  };
}

export function createCroppedImage(
  imageSource,
  pixelCrop
) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.crossOrigin =
        "anonymous";

      image.onload = () => {
        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width = 400;
        canvas.height = 400;

        const context =
          canvas.getContext(
            "2d"
          );

        if (!context) {
          reject(
            new Error(
              "Canvas is not supported."
            )
          );

          return;
        }

        context.imageSmoothingEnabled =
          true;

        context.imageSmoothingQuality =
          "high";

        context.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          400,
          400
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Image could not be created."
                )
              );

              return;
            }

            resolve(blob);
          },
          "image/webp",
          0.9
        );
      };

      image.onerror = () => {
        reject(
          new Error(
            "Image could not be loaded."
          )
        );
      };

      image.src =
        imageSource;
    }
  );
}