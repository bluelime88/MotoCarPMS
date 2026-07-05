// Pick an image from the library, return its local uri (or undefined if cancelled).
import * as ImagePicker from 'expo-image-picker';

export async function pickImage(): Promise<string | undefined> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return undefined;
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.6,
  });
  if (res.canceled) return undefined;
  return res.assets[0].uri;
}
