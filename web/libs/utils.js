import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function calculateTimeLeft(endTime) {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  let timeString = "";
  if (days > 0) timeString += `${days}d `;
  if (hours > 0) timeString += `${hours}h `;
  if (minutes > 0) timeString += `${minutes}m`;

  return timeString.trim() || "Less than a minute";
}

export const uploadImagesToFirebase = async (files, onProgress) => {
  const uploadPromises = Array.from(files).map(async (file) => {
    const imageRef = ref(storage, `imagesproduct/${uuidv4()}-${file.name}`);

    // Create upload task with uploadBytesResumable
    const uploadTask = uploadBytesResumable(imageRef, file);

    // Track upload progress
    if (onProgress) {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress({
            fileName: file.name,
            progress: Math.round(progress),
          });
        },
        (error) => {
          console.error("Upload error:", error);
          throw error;
        }
      );
    }

    // Wait for the upload to complete
    await uploadTask;
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  });

  return Promise.all(uploadPromises);
};
