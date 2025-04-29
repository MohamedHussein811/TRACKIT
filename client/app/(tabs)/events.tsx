import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { Event } from "@/types";
import {
  Calendar,
  MapPin,
  Clock,
  Check,
  X,
  Ticket,
  User,
  DollarSign,
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth-store";
import api from "@/utils/apiClient";

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const router = useRouter();
  const { user } = useAuthStore();
  const userType = user?.userType || "business";
  const [events, setEvents] = useState<Event[]>([]);
  const [soldTickets, setSoldTickets] = useState<any[]>([]); // Replace with actual type if available

  // For event managers, show event requests instead of regular events
  const isEventManager = userType === "organizer";

  // Combine original events with additional events
  const allEvents = [...events];

  const upcomingEvents = allEvents;

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await api.get("/events");
      const sold = await api.get("/reservations");

      setEvents(res.data);
      setSoldTickets(sold.data);
    };

    fetchEvents();
  }, []);

  const handleEventPress = (event: Event) => {
    // Navigate to event details
    /*
    Alert.alert(
      "Reserve Spot",
      `Would you like to reserve a spot for "${event.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reserve",
          onPress: () => {
            // Navigate to event details for registration and payment
            router.push(`/event-details?id=${event._id}&register=true`);
          },
        },
      ]
    );
    router.push(`/event-details?id=${event._id}`);
    */
  };

  const handleReserveSpot = (event: Event) => {
    const isPurchased = soldTickets.some(
      (ticket) =>
        ticket.attendeeName === user?.name &&
        ticket.attendeeEmail === user?.email
    );
    if (isPurchased) {
      // If already registered, just view details
      handleEventPress(event);
    } else {
      console.log(user?.email);
      // If not registered, show confirmation dialog
      Alert.alert(
        "Reserve Spot",
        `Would you like to reserve a spot for "${event.title}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Reserve",
            onPress: () => {
              // Navigate to event details for registration and payment
              router.push(`/event-details?id=${event._id}&register=true`);
            },
          },
        ]
      );
    }
  };

  const handleEventRequestAction = (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    Alert.alert(
      action === "approve" ? "Approve Event" : "Reject Event",
      `Are you sure you want to ${action} this event request?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: action === "approve" ? "Approve" : "Reject",
          style: action === "approve" ? "default" : "destructive",
          onPress: () => {
            // In a real app, this would call an API to approve/reject the event
            Alert.alert(
              "Success",
              `Event request has been ${
                action === "approve" ? "approved" : "rejected"
              }.`,
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const handleViewTicketDetails = (ticket: any) => {
    Alert.alert(
      "Ticket Details",
      `Attendee: ${ticket.attendeeName}
Email: ${ticket.attendeeEmail}
Event: ${ticket.eventId.title}
Date: ${formatDate(ticket.createdAt)}
Ticket Type: ${ticket.ticketType}
Price: $${ticket.price.toFixed(2)}`,
      [{ text: "OK" }]
    );
  };
  /*
  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.eventImage}
        resizeMode="cover"
      />
      {item.isRegistered && (
        <View style={styles.registeredBadge}>
          <Text style={styles.registeredText}>Registered</Text>
        </View>
      )}
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.eventCategory}>{item.category || "General"}</Text>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetailItem}>
            <Calendar
              size={16}
              color={Colors.neutral.gray}
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText}>{formatDate(item.date)}</Text>
          </View>

          <View style={styles.eventDetailItem}>
            <Clock
              size={16}
              color={Colors.neutral.gray}
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText}>{item.time}</Text>
          </View>

          <View style={styles.eventDetailItem}>
            <MapPin
              size={16}
              color={Colors.neutral.gray}
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <Text style={styles.eventPrice}>
            {item.price === 0 || item.price === undefined
              ? "Free"
              : `$${item.price}`}
          </Text>
          <TouchableOpacity
            style={[
              styles.eventButton,
              item.isRegistered && styles.registeredButton,
            ]}
            onPress={() => handleReserveSpot(item)}
          >
            <Text
              style={[
                styles.eventButtonText,
                item.isRegistered && styles.registeredButtonText,
              ]}
            >
              {item.isRegistered ? "View Details" : "Reserve Spot"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  */
  /*
  const renderEventCard = ({ item }: { item: Event }) => {
    // Check if the user has already reserved a spot for this event
    const isPurchased = soldTickets.some(
      (ticket) =>
        ticket.attendeeEmail === user?.email &&
        ticket.attendeeName === user?.name
    );

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        {isPurchased && (
          <View style={styles.registeredBadge}>
            <Text style={styles.registeredText}>Reserved</Text>
          </View>
        )}

        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.eventCategory}>{item.category || "General"}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetailItem}>
              <Calendar
                size={16}
                color={Colors.neutral.gray}
                style={styles.eventDetailIcon}
              />
              <Text style={styles.eventDetailText}>
                {formatDate(item.date)}
              </Text>
            </View>

            <View style={styles.eventDetailItem}>
              <Clock
                size={16}
                color={Colors.neutral.gray}
                style={styles.eventDetailIcon}
              />
              <Text style={styles.eventDetailText}>{item.time}</Text>
            </View>

            <View style={styles.eventDetailItem}>
              <MapPin
                size={16}
                color={Colors.neutral.gray}
                style={styles.eventDetailIcon}
              />
              <Text style={styles.eventDetailText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          </View>

          <View style={styles.eventFooter}>
            <Text style={styles.eventPrice}>
              {item.price === 0 || item.price === undefined
                ? "Free"
                : `$${item.price}`}
            </Text>
            <TouchableOpacity
              style={[
                styles.eventButton,
                isPurchased && styles.registeredButton,
              ]}
              onPress={() => handleReserveSpot(item)}
            >
              <Text
                style={[
                  styles.eventButtonText,
                  isPurchased && styles.registeredButtonText,
                ]}
              >
                {isPurchased ? "View Details" : "Reserve Spot"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  */
  const renderEventCard = ({ item }: { item: Event }) => {
    console.log(user?.name);
    // Check if the user has already reserved a spot for this event
    const isPurchased = soldTickets.some(
      (ticket) =>
        ticket.attendeeName === user?.name &&
        ticket.attendeeEmail === user?.email
    );

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        {isPurchased && (
          <View style={styles.registeredBadge}>
            <Text style={styles.registeredText}>Reserved</Text>
          </View>
        )}

        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.eventCategory}>{item.category || "General"}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetailItem}>
              <Calendar
                size={16}
                color={Colors.neutral.gray}
                style={styles.eventDetailIcon}
              />
              <Text style={styles.eventDetailText}>
                {formatDate(item.date)}
              </Text>
            </View>

            <View style={styles.eventDetailItem}>
              <Clock
                size={16}
                color={Colors.neutral.gray}
                style={styles.eventDetailIcon}
              />
              <Text style={styles.eventDetailText}>{item.time}</Text>
            </View>

            <View style={styles.eventDetailItem}>
              <MapPin
                size={16}
                color={Colors.neutral.gray}
                style={styles.eventDetailIcon}
              />
              <Text style={styles.eventDetailText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          </View>

          <View style={styles.eventFooter}>
            <Text style={styles.eventPrice}>
              {item.price === 0 || item.price === undefined
                ? "Free"
                : `$${item.price}`}
            </Text>
            <TouchableOpacity
              style={[
                styles.eventButton,
                isPurchased && styles.registeredButton,
              ]}
              onPress={() => handleReserveSpot(item)}
            >
              <Text
                style={[
                  styles.eventButtonText,
                  isPurchased && styles.registeredButtonText,
                ]}
              >
                {isPurchased ? "View Details" : "Reserve Spot"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEventRequestCard = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <Text style={styles.requestOrganizer}>By: {item.organizer}</Text>
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.eventDetailItem}>
          <Calendar
            size={16}
            color={Colors.neutral.gray}
            style={styles.eventDetailIcon}
          />
          <Text style={styles.eventDetailText}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.eventDetailItem}>
          <Clock
            size={16}
            color={Colors.neutral.gray}
            style={styles.eventDetailIcon}
          />
          <Text style={styles.eventDetailText}>{item.time}</Text>
        </View>

        <View style={styles.eventDetailItem}>
          <MapPin
            size={16}
            color={Colors.neutral.gray}
            style={styles.eventDetailIcon}
          />
          <Text style={styles.eventDetailText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </View>

      <Text style={styles.requestDescription}>{item.description}</Text>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleEventRequestAction(item._id, "reject")}
        >
          <X size={16} color={Colors.status.error} style={styles.actionIcon} />
          <Text style={[styles.actionText, styles.rejectText]}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleEventRequestAction(item._id, "approve")}
        >
          <Check
            size={16}
            color={Colors.status.success}
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, styles.approveText]}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSoldTicketCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => handleViewTicketDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketIconContainer}>
          <Ticket size={24} color={Colors.primary.burgundy} />
        </View>
        <View style={styles.ticketHeaderContent}>
          <Text style={styles.ticketEventTitle} numberOfLines={1}>
            {item.eventTitle}
          </Text>
          <Text style={styles.ticketPurchaseDate}>
            Purchased: {formatDate(item.purchaseDate)}
          </Text>
        </View>
      </View>

      <View style={styles.ticketDivider} />

      <View style={styles.ticketDetails}>
        <View style={styles.ticketDetailItem}>
          <User
            size={16}
            color={Colors.neutral.gray}
            style={styles.ticketDetailIcon}
          />
          <Text style={styles.ticketDetailLabel}>Attendee:</Text>
          <Text style={styles.ticketDetailText} numberOfLines={1}>
            {item.attendeeName}
          </Text>
        </View>

        <View style={styles.ticketDetailItem}>
          <Calendar
            size={16}
            color={Colors.neutral.gray}
            style={styles.ticketDetailIcon}
          />
          <Text style={styles.ticketDetailLabel}>Event Date:</Text>
          <Text style={styles.ticketDetailText}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        <View style={styles.ticketDetailItem}>
          <DollarSign
            size={16}
            color={Colors.neutral.gray}
            style={styles.ticketDetailIcon}
          />
          <Text style={styles.ticketDetailLabel}>Price:</Text>
          <Text style={styles.ticketDetailText}>${item.price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.ticketFooter}>
        <View style={styles.ticketTypeBadge}>
          <Text style={styles.ticketTypeText}>{item.ticketType}</Text>
        </View>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </View>
    </TouchableOpacity>
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEventManager ? "Event Management" : "Events"}
        </Text>

        {!isEventManager && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "upcoming" && styles.activeTabText,
                ]}
              >
                Upcoming
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "past" && styles.activeTab]}
              onPress={() => setActiveTab("past")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "past" && styles.activeTabText,
                ]}
              >
                Past
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isEventManager && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "upcoming" && styles.activeTabText,
                ]}
              >
                Sold Tickets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "past" && styles.activeTab]}
              onPress={() => setActiveTab("past")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "past" && styles.activeTabText,
                ]}
              >
                Events
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isEventManager && activeTab === "upcoming" ? (
        <FlatList
          data={soldTickets}
          renderItem={renderSoldTicketCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={activeTab === "upcoming" && upcomingEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Only show add button for event organizers */}
      {isEventManager && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-event")}
        >
          <View style={styles.addButtonGradient}>
            <Text style={styles.addButtonText}>+</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary.burgundy,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral.gray,
  },
  activeTabText: {
    color: Colors.neutral.white,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  eventCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventImage: {
    width: "100%",
    height: 160,
  },
  registeredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: "500",
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventDetailIcon: {
    marginRight: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary.burgundy,
  },
  eventButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registeredButton: {
    backgroundColor: Colors.neutral.extraLightGray,
  },
  eventButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: "500",
  },
  registeredButtonText: {
    color: Colors.neutral.darkGray,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary.burgundy,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral.white,
  },
  backIconButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  // Event request card styles
  requestCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  requestOrganizer: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  rejectButton: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  approveButton: {
    backgroundColor: "rgba(0, 255, 0, 0.1)",
    borderWidth: 1,
    borderColor: Colors.status.success,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  rejectText: {
    color: Colors.status.error,
  },
  approveText: {
    color: Colors.status.success,
  },
  // Sold ticket card styles
  ticketCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.neutral.white,
  },
  ticketIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.burgundy + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ticketHeaderContent: {
    flex: 1,
  },
  ticketEventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  ticketPurchaseDate: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  ticketDetails: {
    padding: 16,
  },
  ticketDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketDetailIcon: {
    marginRight: 8,
  },
  ticketDetailLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
    width: 80,
  },
  ticketDetailText: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral.darkGray,
    fontWeight: "500",
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  ticketTypeBadge: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketTypeText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: "500",
  },
  viewDetailsText: {
    fontSize: 14,
    color: Colors.primary.burgundy,
    fontWeight: "500",
  },
});
