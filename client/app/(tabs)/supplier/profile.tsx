import DefaultAvatar from "@/components/DefaultAvatar";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Bell,
    ChevronRight,
    CreditCard,
    FileText,
    HelpCircle,
    LogOut,
    Settings,
    ShieldCheck,
    Trash,
    Truck,
    User,
} from "lucide-react-native";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  // HIGHLIGHT: Added navigation handlers for each profile menu item
  const handlePersonalInfo = () => {
    router.push("/profile/personal-information");
  };

  const handleNotifications = () => {
    router.push("/profile/notifications");
  };

  const handlePaymentMethods = () => {
    router.push("/profile/payment-methods");
  };

  const handleSecurity = () => {
    router.push("/profile/security");
  };

  const handleReportsAnalytics = () => {
    router.push("/profile/reports-analytics");
  };

  const handleShippingInfo = () => {
    router.push("/profile/shipping-information");
  };

  const handleHelpCenter = () => {
    router.push("/profile/help-center");
  };

  const ProfileMenuItem = ({
    icon,
    title,
    onPress,
  }: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <ChevronRight size={20} color={Colors.neutral.gray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={Colors.neutral.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={[Colors.primary.burgundyLight, Colors.primary.burgundy]}
            style={styles.profileCardBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileInfo}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.profileImage}
                />
              ) : (
                <DefaultAvatar size={80} />
              )}
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>
                    {user?.userType === "business"
                      ? "Business Owner"
                      : user?.userType === "supplier"
                      ? "Supplier"
                      : user?.userType === "distributor"
                      ? "Distributor"
                      : "Event Organizer"}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            {/* HIGHLIGHT: Updated onPress handlers for each menu item */}
            <ProfileMenuItem
              icon={<User size={20} color={Colors.primary.burgundy} />}
              title="Personal Information"
              onPress={handlePersonalInfo}
            />
            <ProfileMenuItem
              icon={<Bell size={20} color={Colors.primary.burgundy} />}
              title="Notifications"
              onPress={handleNotifications}
            />
            <ProfileMenuItem
              icon={<CreditCard size={20} color={Colors.primary.burgundy} />}
              title="Payment Methods"
              onPress={handlePaymentMethods}
            />
            <ProfileMenuItem
              icon={<ShieldCheck size={20} color={Colors.primary.burgundy} />}
              title="Security"
              onPress={handleSecurity}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Business</Text>
          <View style={styles.menuContainer}>
            <ProfileMenuItem
              icon={<FileText size={20} color={Colors.primary.burgundy} />}
              title="Reports & Analytics"
              onPress={handleReportsAnalytics}
            />
            <ProfileMenuItem
              icon={<Truck size={20} color={Colors.primary.burgundy} />}
              title="Shipping Information"
              onPress={handleShippingInfo}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          <View style={styles.menuContainer}>
            <ProfileMenuItem
              icon={<HelpCircle size={20} color={Colors.primary.burgundy} />}
              title="Help Center"
              onPress={handleHelpCenter}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={deleteAccount}>
          <Trash size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral.black,
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileCardBackground: {
    padding: 24,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.neutral.white,
  },
  profileTextContainer: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.neutral.white,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.neutral.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  profileBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  profileBadgeText: {
    fontSize: 12,
    color: Colors.neutral.white,
    fontWeight: "500",
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  menuContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.neutral.black,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.neutral.white,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.status.error,
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.neutral.gray,
    marginBottom: 24,
  },
});
