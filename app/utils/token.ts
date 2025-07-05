import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeToken = async (value: string) => {
  try {
    await AsyncStorage.setItem("authToken", value);
  } catch (e) {
    console.error('Saving error:', e);
  }
};

export const getToken = async () => {
  try {
    const value = await AsyncStorage.getItem("authToken");
    if (value !== null) {
      return value;
    }
  } catch (e) {
    console.error('Reading error:', e);
  }
};

export const deleteToken = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
  } catch (e) {
    console.error('Deleting error:', e);
  }
};