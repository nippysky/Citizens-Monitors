import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import TutorialBanner from "@/components/onboarding/TutorialBanner";
import BackButton from "@/components/ui/BackButton";
import AppButton from "@/components/ui/AppButton";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";
import { useToastContext } from "@/components/feedback/ToastProvider";
import { Theme } from "@/theme";
import { router } from "expo-router";
import { Paths } from "@/constants/paths";

type PollingUnitLocationForm = {
  pollingState: string;
  localGovernmentArea: string;
  ward: string;
};

type PollingUnitResultItem = {
  id: string;
  name: string;
  code: string;
  ward: string;
  lga: string;
  state: string;
};

type PollingDirectory = {
  [state: string]: {
    [lga: string]: {
      [ward: string]: PollingUnitResultItem[];
    };
  };
};

const POLLING_DIRECTORY: PollingDirectory = {
  Lagos: {
    Alimosho: {
      "Ward 01": [
        {
          id: "lag-alim-ward01-1",
          name: "Ikotun Community Primary School",
          code: "LA/01/08/004",
          ward: "Ward 01",
          lga: "Alimosho LGA",
          state: "Lagos State",
        },
        {
          id: "lag-alim-ward01-2",
          name: "Mushin Senior Grammar School",
          code: "LA/01/08/017",
          ward: "Ward 01",
          lga: "Alimosho LGA",
          state: "Lagos State",
        },
        {
          id: "lag-alim-ward01-3",
          name: "Ikotun Community Primary School",
          code: "LA/01/08/021",
          ward: "Ward 01",
          lga: "Alimosho LGA",
          state: "Lagos State",
        },
        {
          id: "lag-alim-ward01-4",
          name: "Unity Primary School",
          code: "LA/01/08/032",
          ward: "Ward 01",
          lga: "Alimosho LGA",
          state: "Lagos State",
        },
        {
          id: "lag-alim-ward01-5",
          name: "Community High School Hall",
          code: "LA/01/08/045",
          ward: "Ward 01",
          lga: "Alimosho LGA",
          state: "Lagos State",
        },
        {
          id: "lag-alim-ward01-6",
          name: "St. Peter Civic Centre",
          code: "LA/01/08/051",
          ward: "Ward 01",
          lga: "Alimosho LGA",
          state: "Lagos State",
        },
      ],
      "Ward 02": [
        {
          id: "lag-alim-ward02-1",
          name: "Egbeda Modern School",
          code: "LA/01/09/003",
          ward: "Ward 02",
          lga: "Alimosho LGA",
          state: "Lagos State",
        },
        {
          id: "lag-alim-ward02-2",
          name: "Town Hall Annex",
          code: "LA/01/09/010",
          ward: "Ward 02",
          lga: "Alimosho LGA",
          state: "Lagos State",
        },
      ],
    },
    Ikeja: {
      "Ward A": [
        {
          id: "lag-ikeja-warda-1",
          name: "Alausa Primary School",
          code: "LA/03/01/001",
          ward: "Ward A",
          lga: "Ikeja LGA",
          state: "Lagos State",
        },
        {
          id: "lag-ikeja-warda-2",
          name: "Secretariat Open Ground",
          code: "LA/03/01/004",
          ward: "Ward A",
          lga: "Ikeja LGA",
          state: "Lagos State",
        },
      ],
      "Ward B": [
        {
          id: "lag-ikeja-wardb-1",
          name: "Computer Village Civic Hall",
          code: "LA/03/02/007",
          ward: "Ward B",
          lga: "Ikeja LGA",
          state: "Lagos State",
        },
      ],
    },
  },

  Abuja: {
    Gwagwalada: {
      "Ward Central": [
        {
          id: "abu-gwag-central-1",
          name: "Central Primary School",
          code: "FC/02/01/009",
          ward: "Ward Central",
          lga: "Gwagwalada",
          state: "FCT Abuja",
        },
        {
          id: "abu-gwag-central-2",
          name: "Market Square Hall",
          code: "FC/02/01/011",
          ward: "Ward Central",
          lga: "Gwagwalada",
          state: "FCT Abuja",
        },
      ],
    },
    Bwari: {
      "Ward North": [
        {
          id: "abu-bwari-north-1",
          name: "Bwari Community Secondary School",
          code: "FC/04/03/014",
          ward: "Ward North",
          lga: "Bwari",
          state: "FCT Abuja",
        },
      ],
    },
  },

  Rivers: {
    PortHarcourt: {
      "Ward East": [
        {
          id: "riv-ph-east-1",
          name: "Township Primary School",
          code: "RV/01/02/005",
          ward: "Ward East",
          lga: "Port Harcourt",
          state: "Rivers State",
        },
      ],
    },
  },
};

const INITIAL_FORM: PollingUnitLocationForm = {
  pollingState: "",
  localGovernmentArea: "",
  ward: "",
};

export default function PollingUnitLocatorScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToastContext();

  const stateSheetRef = useRef<BottomSheetModal>(null);
  const lgaSheetRef = useRef<BottomSheetModal>(null);
  const wardSheetRef = useRef<BottomSheetModal>(null);

  const [form, setForm] = useState<PollingUnitLocationForm>(INITIAL_FORM);

  const [stateQuery, setStateQuery] = useState("");
  const [lgaQuery, setLgaQuery] = useState("");
  const [wardQuery, setWardQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [results, setResults] = useState<PollingUnitResultItem[]>([]);

  const states = useMemo(() => Object.keys(POLLING_DIRECTORY), []);

  const lgas = useMemo(() => {
    if (!form.pollingState) return [];
    return Object.keys(POLLING_DIRECTORY[form.pollingState] ?? {});
  }, [form.pollingState]);

  const wards = useMemo(() => {
    if (!form.pollingState || !form.localGovernmentArea) return [];
    return Object.keys(
      POLLING_DIRECTORY[form.pollingState]?.[form.localGovernmentArea] ?? {}
    );
  }, [form.pollingState, form.localGovernmentArea]);

  const filteredStates = useMemo(() => {
    const q = stateQuery.trim().toLowerCase();
    if (!q) return states;
    return states.filter((item) => item.toLowerCase().includes(q));
  }, [states, stateQuery]);

  const filteredLgas = useMemo(() => {
    const q = lgaQuery.trim().toLowerCase();
    if (!q) return lgas;
    return lgas.filter((item) => item.toLowerCase().includes(q));
  }, [lgas, lgaQuery]);

  const filteredWards = useMemo(() => {
    const q = wardQuery.trim().toLowerCase();
    if (!q) return wards;
    return wards.filter((item) => item.toLowerCase().includes(q));
  }, [wards, wardQuery]);

  const modalSubtitle = useMemo(() => {
    if (!form.pollingState || !form.localGovernmentArea || !form.ward) {
      return "Locate your polling unit below.";
    }

    return `Locate your polling unit in ${form.pollingState.toLowerCase()} state in ${form.localGovernmentArea.toLowerCase()} local government area, ${form.ward.toLowerCase()} below.`;
  }, [form]);

  const handleLocatePollingUnit = async () => {
    if (!form.pollingState) {
      showToast({
        type: "error",
        message: "Please select your polling unit state.",
      });
      return;
    }

    if (!form.localGovernmentArea) {
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

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    const located =
      POLLING_DIRECTORY[form.pollingState]?.[form.localGovernmentArea]?.[
        form.ward
      ] ?? [];

    setLoading(false);

    if (!located.length) {
      showToast({
        type: "error",
        message: "No polling units found for this selection.",
      });
      return;
    }

    setResults(located);
    setResultsVisible(true);
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
              Locate your polling unit in your state and local government area
              below.
            </AppText>
          </View>

          <TutorialBanner />

          <View style={styles.form}>
            <AppSelectField
              label="Polling Unit State"
              value={form.pollingState}
              placeholder="Select state"
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
              value={form.localGovernmentArea}
              placeholder="Select state first"
              onPress={() => {
                if (!form.pollingState) return;
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
              placeholder="Select LGA first"
              onPress={() => {
                if (!form.localGovernmentArea) return;
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
            style={styles.locateButton}
          />
        </ScrollView>
      </AppGradientScreen>

      <SelectPickerSheet
        ref={stateSheetRef}
        title="Select State"
        query={stateQuery}
        onChangeQuery={setStateQuery}
        selectedValue={form.pollingState}
        onSelectValue={(pollingState) =>
          setForm({
            pollingState,
            localGovernmentArea: "",
            ward: "",
          })
        }
        options={filteredStates}
      />

      <SelectPickerSheet
        ref={lgaSheetRef}
        title="Select LGA"
        query={lgaQuery}
        onChangeQuery={setLgaQuery}
        selectedValue={form.localGovernmentArea}
        onSelectValue={(localGovernmentArea) =>
          setForm({
            ...form,
            localGovernmentArea,
            ward: "",
          })
        }
        options={filteredLgas}
      />

      <SelectPickerSheet
        ref={wardSheetRef}
        title="Select Ward"
        query={wardQuery}
        onChangeQuery={setWardQuery}
        selectedValue={form.ward}
        onSelectValue={(ward) =>
          setForm({
            ...form,
            ward,
          })
        }
        options={filteredWards}
      />

      <PollingUnitResultsModal
        visible={resultsVisible}
        onClose={() => setResultsVisible(false)}
        title="Nearby Polling Units"
        subtitle={modalSubtitle}
        results={results}
      />

      <AppScreenLoader visible={loading} />
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
  results: PollingUnitResultItem[];
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <AppGradientScreen>
        <View
          style={[
            styles.modalContainer,
            {
              paddingTop: insets.top + 12,
              paddingBottom: Math.max(insets.bottom + 18, 24),
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
            <AppText style={styles.modalTitle}>{title}</AppText>
            <AppText style={styles.modalSubtitle}>{subtitle}</AppText>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsContent}
          >
            {results.map((item) => (
              <View key={item.id} style={styles.resultRow}>
                <View style={styles.resultAccent} />

                <View style={styles.resultBody}>
                  <AppText style={styles.resultName}>
                    {item.name}
                    {"\n"}
                    {item.code}
                  </AppText>

                  <View style={styles.resultMetaRow}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#9AA3B2"
                    />
                    <AppText style={styles.resultMetaText}>
                      {item.ward}, {item.lga} · {item.state}
                    </AppText>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </AppGradientScreen>
    </Modal>
  );
}

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

  modalContainer: {
    flex: 1,
    paddingHorizontal: 16,
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
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalHeaderBlock: {
    gap: 10,
    paddingTop: 18,
    paddingBottom: 20,
  },

  modalTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  modalSubtitle: {
    maxWidth: 360,
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },

  resultsContent: {
    gap: 18,
    paddingBottom: 18,
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },

  resultAccent: {
    width: 4,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },

  resultBody: {
    flex: 1,
    gap: 10,
    paddingVertical: 6,
  },

  resultName: {
    fontSize: 15,
    lineHeight: 19,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  resultMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  resultMetaText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
});