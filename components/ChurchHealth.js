import React from "react";
import {
  Image,
  ImageBackground,
  Switch,
  Text,
  View,
  Pressable,
} from "react-native";
import { SvgUri } from "react-native-svg";

import ListItem from "components/ListItem";
import SheetHeader from "components/Sheet/SheetHeader";

import useBottomSheet from "hooks/use-bottom-sheet";
import useI18N from "hooks/use-i18n";
import useStyles from "hooks/use-styles";
import useSettings from "hooks/use-settings";

import { circleIcon, dottedCircleIcon } from "constants/icons";

import { ChurchHealthConstants } from "constants";
import { baptizeIconChurchHealth } from "constants/icons";

import { localStyles } from "./ChurchHealth.styles";

const size = 250;
const symbolSize = 16;

const radius = size / 2;
const center = radius;

const ChurchCommitment = ({
  hasChurchCommitment,
  toggleChurchCommitment,
  styles,
}) => {
  const { i18n } = useI18N();
  return (
    <ListItem
      label={i18n.t("global.churchCommitment")}
      endComponent={
        <View style={styles.churchCommitmentSwitch}>
          <Switch
            trackColor={{ true: styles.switch.color }}
            thumbColor={styles.switch}
            value={hasChurchCommitment}
            onChange={toggleChurchCommitment}
          />
        </View>
      }
      style={styles.listItem}
    />
  );
};

const ChurchHealth = ({ post, selectedItems, onChange }) => {
  const { styles, globalStyles } = useStyles(localStyles);

  const { settings } = useSettings();
  const { expand, collapse } = useBottomSheet();

  const showSheet = (iconDescription = "") => {
    expand({
      renderHeader: () => (
        <SheetHeader
          expandable
          dismissable
          title="Church Health"
          onDismiss={collapse}
        />
      ),
      renderFooter: () => null,
      renderContent: () => (
        <View style={{ marginHorizontal: 10 }}>
          <Text style={globalStyles.text}>{iconDescription}</Text>
        </View>
      ),
    });
  };

  const toggleChurchCommitment = () =>
    onChange({ key: ChurchHealthConstants.CHURCH_COMMITMENT });

  const isSelected = ({ key }) =>
    selectedItems?.some((item) => item?.key === key);

  const hasChurchCommitment = isSelected({
    key: ChurchHealthConstants.CHURCH_COMMITMENT,
  });

  let degToRad = ({ angle }) => {
    return (angle * Math.PI) / 180;
  };

  let renderIcons = () => {
    // TODO: constants
    const iconsData =
      settings?.["post_types"]?.["groups"]?.fields?.health_metrics?.default ||
      {};
    let iconsDataArray = [];

    // MAKING AN ARRAY OF OBJECTS FROM AN OBJECT OF OBJECTS
    for (let [key, value] of Object.entries(iconsData || {})) {
      if (
        key !== ChurchHealthConstants.CHURCH_COMMITMENT &&
        value.icon !== ""
      ) {
        iconsDataArray.push({ key, value });
      }
    }

    let totalIcons = iconsDataArray.length;
    let svgIconsArray = [];
    let angle = 0;
    let increaseAngle = Math.floor(360 / totalIcons);

    for (let i = 0; i < totalIcons; i++) {
      let angleRad = degToRad({ angle });
      let x = radius * Math.cos(angleRad) + center - symbolSize / 2;
      let y = radius * Math.sin(angleRad) + center - symbolSize / 2;
      let selected = isSelected({ key: iconsDataArray[i].key });

      let tempComp = (
        <Pressable
          onLongPress={() => showSheet(iconsDataArray[i].value.description)}
          style={{
            left: x + 25,
            top: y + 25,
            position: "absolute",
          }}
          onPress={() => onChange(iconsDataArray[i])}
          key={iconsDataArray[i].value.description}
        >
          <SvgUri
            width={40}
            height={40}
            style={styles.iconImage(selected)}
            uri={iconsDataArray[i].value.icon}
          />
        </Pressable>
      );
      svgIconsArray.push(tempComp);
      angle += increaseAngle;
    }
    return svgIconsArray;
  };

  let baptizedCount = 0;

  if (post?.baptized_count) {
    // New field
    baptizedCount = post.baptized_count;
  } else if (post?.baptized_member_count) {
    baptizedCount = post.baptized_member_count;
  }
  return (
    <>
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <View>
            <ImageBackground
              source={hasChurchCommitment ? circleIcon : dottedCircleIcon}
              style={styles.circle}
              imageStyle={styles.circleImage(hasChurchCommitment)}
            />
            {renderIcons()}
          </View>
        </View>

        <View style={styles.baptismMainContainer}>
          <View style={styles.baptismContainer}>
            <Text>
              {post?.member_count ? post.member_count - baptizedCount : 0}
            </Text>
            <Image
              resizeMode="contain"
              source={baptizeIconChurchHealth}
              style={styles.baptizeIconChurchHealth}
            />
            <Text>{baptizedCount ?? ""}</Text>
          </View>

          <View style={{ padding: 5 }}>
            <ChurchCommitment
              hasChurchCommitment={hasChurchCommitment}
              toggleChurchCommitment={toggleChurchCommitment}
              styles={styles}
            />
          </View>
        </View>
      </View>
    </>
  );
};
export default ChurchHealth;
