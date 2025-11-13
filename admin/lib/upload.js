// utils/upload.ts
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { storage } from "@/libs/firebase"

export async function uploadImage(file) {
  const uniqueFileName = `${Date.now()}_${file.name}`
  const fileRef = ref(storage, `images/${uniqueFileName}`)
  const uploadTask = await uploadBytesResumable(fileRef, file)
  const downloadUrl = await getDownloadURL(uploadTask.ref)
  return downloadUrl
}
