import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs();

interface AppBarProps {
    title: string;
    isCanGoBack: boolean;
    onBackPress?: () => void;
  }
  const AppBar: React.FC<AppBarProps> = ({ title, isCanGoBack, onBackPress }) => {
    const navigation = useRouter();
    const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
        navigation.back();
    }
  };

  return (
    <SafeAreaView
    style={{ paddingTop: insets.top, backgroundColor: "white" }}
  >
    <View style={styles.appBar}>
      {isCanGoBack && (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text><MaterialIcons name="arrow-back" size={24} color="black" /></Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  backButton: {
    position: "absolute",
    left: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "white",
  },
});

export default AppBar;