import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Linking,
  ListRenderItemInfo,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import { useToastContext } from "@/components/feedback/ToastProvider";
import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";
import { Paths } from "@/constants/paths";
import {
  useLocalGovernmentsQuery,
  useStatesQuery,
  useWardsQuery,
} from "@/hooks/api/useLocationQueries";
import { usePollingUnitLookupMutation } from "@/hooks/api/usePollingUnitLookupMutation";
import { PollingUnitLookupItem } from "@/lib/api/pollingUnitLocator.api";
import { Theme } from "@/theme";

type PollingUnitLocatorForm = {
  state: string;
  lga: string;
  ward: string;
};

const INITIAL_FORM: PollingUnitLocatorForm = {
  state: "",
  lga: "",
  ward: "",
};

function filterOptions(options: string[], query: string): string[] {
  const cleanQuery = query.trim().toLowerCase();

  if (!cleanQuery) return options;

  return options.filter((item) => item.toLowerCase().includes(cleanQuery));
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getPollingUnitKey(item: PollingUnitLookupItem, index: number): string {
  return String(
    item.id ??
      item._id ??
      `${item.name ?? "polling-unit"}-${item.delimitation ?? index}-${index}`
  );
}

function getPollingUnitName(item: PollingUnitLookupItem): string {
  return item.name?.trim() || "Unnamed Polling Unit";
}

function getPollingUnitCode(item: PollingUnitLookupItem): string {
  return (
    item.delimitation?.trim() ||
    item.units?.trim() ||
    item.abbreviation?.trim() ||
    "N/A"
  );
}

function getPollingUnitWard(item: PollingUnitLookupItem): string {
  return item.ward_name?.trim() || "Unknown ward";
}

function getPollingUnitLga(item: PollingUnitLookupItem): string {
  return item.local_government_name?.trim() || "Unknown LGA";
}

function getPollingUnitState(item: PollingUnitLookupItem): string {
  return item.state_name?.trim() || "Unknown state";
}

function getPollingUnitArea(item: PollingUnitLookupItem): string {
  return `${getPollingUnitWard(item)}, ${getPollingUnitLga(
    item
  )} · ${getPollingUnitState(item)}`;
}

function getPollingUnitAddress(item: PollingUnitLookupItem): string {
  return (
    item.location?.formatted_address?.trim() ||
    item.precise_location?.trim() ||
    `${getPollingUnitName(item)}, ${getPollingUnitWard(
      item
    )}, ${getPollingUnitLga(item)}, ${getPollingUnitState(item)}`
  );
}

function toCoordinate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getPollingUnitCoordinates(item: PollingUnitLookupItem): {
  latitude: number;
  longitude: number;
} | null {
  const latitude = toCoordinate(item.location?.latitude);
  const longitude = toCoordinate(item.location?.longitude);

  if (latitude === null || longitude === null) return null;

  return { latitude, longitude };
}

function getPollingUnitMapCandidates(item: PollingUnitLookupItem): string[] {
  const candidates: string[] = [];
  const coordinates = getPollingUnitCoordinates(item);
  const directUrl = item.location?.google_map_url?.trim();
  const address = getPollingUnitAddress(item);
  const label = getPollingUnitName(item);
  const query = coordinates
    ? `${coordinates.latitude},${coordinates.longitude}`
    : address;

  const encodedQuery = encodeURIComponent(query);
  const encodedLabel = encodeURIComponent(label);

  if (Platform.OS === "android") {
    if (coordinates) {
      candidates.push(
        `geo:${coordinates.latitude},${coordinates.longitude}?q=${coordinates.latitude},${coordinates.longitude}(${encodedLabel})`
      );
    } else {
      candidates.push(`geo:0,0?q=${encodedQuery}`);
    }
  }

  if (Platform.OS === "ios") {
    candidates.push(`comgooglemaps://?q=${encodedQuery}`);
    candidates.push(`maps://?q=${encodedQuery}`);
  }

  if (directUrl) {
    candidates.push(directUrl);
  }

  candidates.push(
    `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`
  );

  return Array.from(new Set(candidates));
}

async function openPollingUnitMap(item: PollingUnitLookupItem): Promise<boolean> {
  const candidates = getPollingUnitMapCandidates(item);

  for (const url of candidates) {
    try {
      const isWebUrl = url.startsWith("http://") || url.startsWith("https://");

      if (isWebUrl) {
        await Linking.openURL(url);
        return true;
      }

      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return false;
}

function pollingUnitMatchesSearch(
  item: PollingUnitLookupItem,
  query: string
): boolean {
  const cleanQuery = query.trim().toLowerCase();

  if (!cleanQuery) return true;

  const searchable = [
    getPollingUnitName(item),
    getPollingUnitCode(item),
    getPollingUnitWard(item),
    getPollingUnitLga(item),
    getPollingUnitState(item),
    getPollingUnitAddress(item),
    item.remark ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(cleanQuery);
}

export default function PollingUnitLocatorScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToastContext();

  const stateSheetRef = useRef<BottomSheetModal>(null);
  const lgaSheetRef = useRef<BottomSheetModal>(null);
  const wardSheetRef = useRef<BottomSheetModal>(null);

  const [form, setForm] = useState<PollingUnitLocatorForm>(INITIAL_FORM);

  const [stateQuery, setStateQuery] = useState("");
  const [lgaQuery, setLgaQuery] = useState("");
  const [wardQuery, setWardQuery] = useState("");

  const [resultsVisible, setResultsVisible] = useState(false);
  const [results, setResults] = useState<PollingUnitLookupItem[]>([]);
  const [resultCount, setResultCount] = useState(0);

  const statesQuery = useStatesQuery();
  const lgasQuery = useLocalGovernmentsQuery(form.state);
  const wardsQuery = useWardsQuery(form.state, form.lga);
  const lookupMutation = usePollingUnitLookupMutation();

  const stateOptions = useMemo(
    () => statesQuery.data ?? [],
    [statesQuery.data]
  );

  const lgaOptions = useMemo(() => lgasQuery.data ?? [], [lgasQuery.data]);

  const wardOptions = useMemo(() => wardsQuery.data ?? [], [wardsQuery.data]);

  const filteredStates = useMemo(
    () => filterOptions(stateOptions, stateQuery),
    [stateOptions, stateQuery]
  );

  const filteredLgas = useMemo(
    () => filterOptions(lgaOptions, lgaQuery),
    [lgaOptions, lgaQuery]
  );

  const filteredWards = useMemo(
    () => filterOptions(wardOptions, wardQuery),
    [wardOptions, wardQuery]
  );

  const isFormComplete = Boolean(form.state && form.lga && form.ward);

  const isLoading =
    lookupMutation.isPending ||
    statesQuery.isLoading ||
    lgasQuery.isFetching ||
    wardsQuery.isFetching;

  const modalSubtitle = useMemo(() => {
    if (!form.state || !form.lga || !form.ward) {
      return "Polling units matching your selection will appear here.";
    }

    return `Polling units in ${form.ward}, ${form.lga}, ${form.state}.`;
  }, [form.lga, form.state, form.ward]);

  useEffect(() => {
    setResults([]);
    setResultCount(0);
    setResultsVisible(false);
  }, [form.state, form.lga, form.ward]);

  const handleSelectState = (state: string): void => {
    setForm({
      state,
      lga: "",
      ward: "",
    });

    setLgaQuery("");
    setWardQuery("");
  };

  const handleSelectLga = (lga: string): void => {
    setForm((previous) => ({
      ...previous,
      lga,
      ward: "",
    }));

    setWardQuery("");
  };

  const handleSelectWard = (ward: string): void => {
    setForm((previous) => ({
      ...previous,
      ward,
    }));
  };

  const handleLocatePollingUnit = async (): Promise<void> => {
    if (!form.state) {
      showToast({
        type: "error",
        message: "Please select your polling unit state.",
      });
      return;
    }

    if (!form.lga) {
      showToast({
        type: "error",
        message: "Please select your local government area.",
      });
      return;
    }

    if (!form.ward) {
      showToast({
        type: "error",
        message: "Please select your ward.",
      });
      return;
    }

    try {
      const response = await lookupMutation.mutateAsync({
        state: form.state,
        lga: form.lga,
        ward: form.ward,
      });

      if (!response.pollingUnits.length) {
        showToast({
          type: "error",
          message: "No polling units found for this selection.",
        });
        return;
      }

      setResults(response.pollingUnits);
      setResultCount(response.count);
      setResultsVisible(true);
    } catch (error) {
      showToast({
        type: "error",
        message: getErrorMessage(
          error,
          "Unable to locate polling units. Please try again."
        ),
      });
    }
  };

  return (
    <>
      <AppGradientScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 28, 36) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topRow}>
            <BackButton />

            <Pressable
              style={styles.helpBtn}
              onPress={() => router.push(Paths.appHelpSupport)}
              hitSlop={10}
            >
              <AppText style={styles.helpText}>Get help</AppText>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={Theme.colors.primary}
              />
            </Pressable>
          </View>

          <View style={styles.headerBlock}>
            <AppText style={styles.title}>Polling Unit Locator</AppText>
            <AppText style={styles.subtitle}>
              Select your state, local government area, and ward to find polling
              units available in that ward.
            </AppText>
          </View>

          <TutorialBanner />

          <View style={styles.form}>
            <AppSelectField
              label="Polling Unit State"
              value={form.state}
              placeholder={
                statesQuery.isLoading ? "Loading states..." : "Select state"
              }
              onPress={() => {
                setStateQuery("");
                stateSheetRef.current?.present();
              }}
              leftIcon={
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={20}
                  color={Theme.colors.textSoft}
                />
              }
            />

            <AppSelectField
              label="Local Government Area"
              value={form.lga}
              placeholder={
                !form.state
                  ? "Select state first"
                  : lgasQuery.isFetching
                    ? "Loading LGAs..."
                    : "Select LGA"
              }
              onPress={() => {
                if (!form.state) {
                  showToast({
                    type: "error",
                    message: "Please select a state first.",
                  });
                  return;
                }

                setLgaQuery("");
                lgaSheetRef.current?.present();
              }}
              leftIcon={
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={20}
                  color={Theme.colors.textSoft}
                />
              }
            />

            <AppSelectField
              label="Ward"
              value={form.ward}
              placeholder={
                !form.lga
                  ? "Select LGA first"
                  : wardsQuery.isFetching
                    ? "Loading wards..."
                    : "Select ward"
              }
              onPress={() => {
                if (!form.lga) {
                  showToast({
                    type: "error",
                    message: "Please select an LGA first.",
                  });
                  return;
                }

                setWardQuery("");
                wardSheetRef.current?.present();
              }}
              leftIcon={
                <MaterialCommunityIcons
                  name="shape-outline"
                  size={20}
                  color={Theme.colors.textSoft}
                />
              }
            />
          </View>

          <AppButton
            title="Locate Polling Unit"
            onPress={handleLocatePollingUnit}
            loading={lookupMutation.isPending}
            disabled={!isFormComplete || lookupMutation.isPending}
            style={styles.locateButton}
          />
        </ScrollView>
      </AppGradientScreen>

      <SelectPickerSheet
        ref={stateSheetRef}
        title="Select State"
        query={stateQuery}
        onChangeQuery={setStateQuery}
        selectedValue={form.state}
        onSelectValue={handleSelectState}
        options={filteredStates}
      />

      <SelectPickerSheet
        ref={lgaSheetRef}
        title="Select LGA"
        query={lgaQuery}
        onChangeQuery={setLgaQuery}
        selectedValue={form.lga}
        onSelectValue={handleSelectLga}
        options={filteredLgas}
      />

      <SelectPickerSheet
        ref={wardSheetRef}
        title="Select Ward"
        query={wardQuery}
        onChangeQuery={setWardQuery}
        selectedValue={form.ward}
        onSelectValue={handleSelectWard}
        options={filteredWards}
      />

      <PollingUnitResultsModal
        visible={resultsVisible}
        onClose={() => setResultsVisible(false)}
        title={`${resultCount || results.length} Polling Units Found`}
        subtitle={modalSubtitle}
        results={results}
      />

      <AppScreenLoader visible={isLoading && !resultsVisible} />
    </>
  );
}

function PollingUnitResultsModal({
  visible,
  onClose,
  title,
  subtitle,
  results,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  results: PollingUnitLookupItem[];
}) {
  const insets = useSafeAreaInsets();
  const { showToast } = useToastContext();

  const listRef = useRef<FlatList<PollingUnitLookupItem>>(null);
  const showBackToTopRef = useRef(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const filteredResults = useMemo(
    () => results.filter((item) => pollingUnitMatchesSearch(item, searchQuery)),
    [results, searchQuery]
  );

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      setShowBackToTop(false);
      showBackToTopRef.current = false;

      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      });
    }
  }, [visible]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, [searchQuery]);

  const handleOpenMap = useCallback(
    async (item: PollingUnitLookupItem): Promise<void> => {
      const opened = await openPollingUnitMap(item);

      if (!opened) {
        showToast({
          type: "error",
          message: "Unable to open map location on this device.",
        });
      }
    },
    [showToast]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const shouldShow = event.nativeEvent.contentOffset.y > 420;

      if (showBackToTopRef.current === shouldShow) return;

      showBackToTopRef.current = shouldShow;
      setShowBackToTop(shouldShow);
    },
    []
  );

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<PollingUnitLookupItem>) => (
      <PollingUnitResultCard
        item={item}
        index={index}
        onOpenMap={() => {
          void handleOpenMap(item);
        }}
      />
    ),
    [handleOpenMap]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <View style={styles.modalRoot}>
        <LinearGradient
          colors={["#F6F2DC", "#FAF8EE", "#FFFFFF", "#FFFFFF"]}
          locations={[0, 0.28, 0.58, 1]}
          style={styles.modalGradient}
        />

        <View
          style={[
            styles.stickyResultsHeader,
            {
              paddingTop: insets.top + 12,
            },
          ]}
        >
          <View style={styles.modalHeaderRow}>
            <View style={styles.modalHeaderSpacer} />

            <Pressable onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={28} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.modalHeaderBlock}>
            <View style={styles.modalBadge}>
              <Ionicons
                name="location"
                size={16}
                color={Theme.colors.primary}
              />
              <AppText style={styles.modalBadgeText}>
                Live INEC Directory
              </AppText>
            </View>

            <AppText style={styles.modalTitle}>{title}</AppText>
            <AppText style={styles.modalSubtitle}>{subtitle}</AppText>
          </View>

          <View style={styles.searchWrap}>
            <AppInput
              placeholder="Search polling unit name, code, or area"
              value={searchQuery}
              onChangeText={setSearchQuery}
              startIcon={
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={Theme.colors.textSoft}
                />
              }
              endIcon={
                searchQuery ? (
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Theme.colors.textSoft}
                  />
                ) : undefined
              }
              onPressEndIcon={() => setSearchQuery("")}
            />
          </View>

          <View style={styles.resultsMetaRow}>
            <AppText style={styles.resultsMetaText}>
              Showing {filteredResults.length} of {results.length}
            </AppText>

            {searchQuery ? (
              <Pressable
                onPress={() => setSearchQuery("")}
                hitSlop={8}
                style={styles.clearSearchButton}
              >
                <AppText style={styles.clearSearchText}>Clear search</AppText>
              </Pressable>
            ) : null}
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={filteredResults}
          keyExtractor={getPollingUnitKey}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={9}
          removeClippedSubviews={Platform.OS === "android"}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.resultsContent,
            {
              paddingBottom: Math.max(insets.bottom + 104, 128),
            },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyResultsCard}>
              <View style={styles.emptyResultsIcon}>
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={Theme.colors.textMuted}
                />
              </View>
              <AppText style={styles.emptyResultsTitle}>
                No matching polling units
              </AppText>
              <AppText style={styles.emptyResultsText}>
                Try searching by another part of the name, code, ward, LGA, or
                state.
              </AppText>
            </View>
          }
        />

        {showBackToTop ? (
          <Pressable
            onPress={scrollToTop}
            hitSlop={10}
            style={[
              styles.backToTopButton,
              {
                bottom: Math.max(insets.bottom + 24, 34),
              },
            ]}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

const PollingUnitResultCard = memo(function PollingUnitResultCard({
  item,
  index,
  onOpenMap,
}: {
  item: PollingUnitLookupItem;
  index: number;
  onOpenMap: () => void;
}) {
  const name = getPollingUnitName(item);
  const code = getPollingUnitCode(item);
  const area = getPollingUnitArea(item);
  const address = getPollingUnitAddress(item);
  const status = item.remark?.trim() || "Existing PU";

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultTopRow}>
        <View style={styles.resultIndexPill}>
          <AppText style={styles.resultIndexText}>
            {String(index + 1).padStart(2, "0")}
          </AppText>
        </View>

        <View style={styles.resultTitleWrap}>
          <AppText style={styles.resultName}>{name}</AppText>

          <View style={styles.codeRow}>
            <AppText style={styles.codeLabel}>Code</AppText>
            <AppText style={styles.codeValue}>{code}</AppText>
          </View>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <AppText numberOfLines={1} style={styles.statusPillText}>
            {status}
          </AppText>
        </View>
      </View>

      <View style={styles.resultDetailBlock}>
        <View style={styles.resultMetaRow}>
          <View style={styles.resultIconWrap}>
            <Ionicons
              name="location-outline"
              size={17}
              color={Theme.colors.textMuted}
            />
          </View>
          <AppText style={styles.resultMetaText}>{area}</AppText>
        </View>

        <View style={styles.resultMetaRow}>
          <View style={styles.resultIconWrap}>
            <Ionicons
              name="map-outline"
              size={17}
              color={Theme.colors.textMuted}
            />
          </View>
          <AppText style={styles.resultMetaText}>{address}</AppText>
        </View>
      </View>

      <Pressable onPress={onOpenMap} style={styles.mapButton}>
        <View style={styles.mapButtonIcon}>
          <Ionicons
            name="navigate-outline"
            size={16}
            color={Theme.colors.primary}
          />
        </View>

        <AppText style={styles.mapButtonText}>Open Google Maps</AppText>

        <Ionicons
          name="chevron-forward"
          size={15}
          color={Theme.colors.primary}
        />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },
  topRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  helpBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  helpText: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  headerBlock: {
    gap: 10,
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  subtitle: {
    maxWidth: 360,
    color: Theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  locateButton: {
    marginTop: 50,
    marginVertical: 0,
  },

  modalRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  stickyResultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "rgba(250,248,238,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,26,50,0.06)",
    zIndex: 5,
  },
  modalHeaderRow: {
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalHeaderSpacer: {
    width: 44,
    height: 44,
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.86)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  modalHeaderBlock: {
    gap: 10,
    paddingTop: 14,
    paddingBottom: 14,
  },
  modalBadge: {
    alignSelf: "flex-start",
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 11,
    backgroundColor: "rgba(25,183,176,0.09)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  modalTitle: {
    fontSize: 24,
    lineHeight: 30,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    maxWidth: 370,
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },
  searchWrap: {
    paddingTop: 2,
  },
  resultsMetaRow: {
    minHeight: 30,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsMetaText: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  clearSearchButton: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "rgba(17,26,50,0.06)",
  },
  clearSearchText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  resultsContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },

  resultCard: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(17,26,50,0.08)",
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 2,
  },
  resultTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  resultIndexPill: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(17,26,50,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultIndexText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  resultTitleWrap: {
    flex: 1,
    gap: 7,
  },
  resultName: {
    fontSize: 15.5,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
    letterSpacing: -0.1,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  codeLabel: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  statusPill: {
    minHeight: 28,
    maxWidth: 104,
    borderRadius: 999,
    paddingHorizontal: 8,
    backgroundColor: "rgba(25,183,176,0.06)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },
  statusPillText: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 13,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    textTransform: "uppercase",
  },
  resultDetailBlock: {
    gap: 10,
    paddingTop: 14,
    paddingBottom: 14,
  },
  resultMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  resultIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(17,26,50,0.045)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultMetaText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
  mapButton: {
    minHeight: 44,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: "rgba(25,183,176,0.06)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapButtonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapButtonText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  backToTopButton: {
    position: "absolute",
    right: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
    zIndex: 10,
  },

  emptyResultsCard: {
    marginTop: 28,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(17,26,50,0.08)",
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: "center",
    gap: 10,
  },
  emptyResultsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(17,26,50,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyResultsTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },
  emptyResultsText: {
    maxWidth: 280,
    fontSize: 13.5,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
});