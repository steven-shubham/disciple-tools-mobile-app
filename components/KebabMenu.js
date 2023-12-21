import React, { useState, useEffect } from "react";
import { Linking, View, Share } from "react-native";
import { KebabIcon } from "components/Icon";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";

import SheetHeader from "components/Sheet/SheetHeader";

import useI18N from "hooks/use-i18n";
import useStyles from "hooks/use-styles";
import useBottomSheet from "hooks/use-bottom-sheet";
import useAPI from "hooks/use-api";
import useMyUser from "hooks/use-my-user";

import axios from "services/axios";
import { ARROW_DEFINITIONS } from "constants";
import ArrowDefinitions from "./ArrowDefinitions/ArrowDefinitions";
import { REGISTERED } from "constants";

const KebabMenu = ({ items }) => {
  const { globalStyles } = useStyles();
  const { i18n } = useI18N();
  const [visible, setVisible] = useState(false);
  const [shareAppUrls, setShareAppUrls] = useState({ ios: "", android: "" });
  const { expand, collapse } = useBottomSheet();
  const { data: userData } = useMyUser();

  let role = Object.values(userData?.profile?.roles ?? {})?.[0] ?? "";

  useEffect(() => {
    async function fetchAppURLs() {
      try {
        const url = "jwt-auth/v1/appshare/links";
        const response = await axios({
          url,
          method: "GET",
        });

        if (response?.status === 200) {
          // console.log("--response?.data fetchAppURLs--", response?.data);
          if (response?.data) {
            setShareAppUrls(response?.data);
          }
        }
      } catch (error) {
        // console.log("--error--", error);
      }
    }

    fetchAppURLs();
  }, []);

  if (!items)
    items = [
      {
        label: i18n.t("global.viewOnWeb"),
        urlPath: `#`,
      },
      {
        label: i18n.t("global.documentation"),
        url: `https://disciple.tools/user-docs/disciple-tools-mobile-app/how-to-use/`,
      },
      {
        label: ARROW_DEFINITIONS,
        showArrowDefinitions: true,
      },
    ];

  const showSheet = (label = "") => {
    expand({
      renderHeader: () => (
        <SheetHeader
          expandable
          dismissable
          title={label}
          onDismiss={collapse}
        />
      ),
      renderFooter: () => null,
      renderContent: () => <ArrowDefinitions />,
    });
  };

  if (role === REGISTERED) {
    return null;
  }
  return (
    <Menu
      visible={visible}
      anchor={
        <KebabIcon onPress={() => setVisible(true)} style={globalStyles.icon} />
      }
      onRequestClose={() => setVisible(false)}
    >
      {items?.map((item, idx) => {
        let url = null;
        if (item?.url) url = item?.url;
        if (item?.urlPath) {
          const baseUrl = axios?.defaults?.baseURL?.split("/wp-json")?.[0];
          if (baseUrl) url = `${baseUrl}/${item?.urlPath}`;
        }

        const _key = `${item?.url}-${idx}`;
        return (
          <View key={_key}>
            <MenuItem
              onPress={async () => {
                if (item?.callback) {
                  item.callback();
                } else if (item?.showArrowDefinitions) {
                  showSheet(item?.label);
                } else if (item?.shareApp) {
                  try {
                    const result = await Share.share({
                      title: "Arrow App link",
                      message: `Arrow App link: iOS- ${shareAppUrls.ios} Android- ${shareAppUrls.android}`,
                    });
                    if (result.action === Share.sharedAction) {
                      if (result.activityType) {
                        // shared with activity type of result.activityType
                      } else {
                        // shared
                      }
                    } else if (result.action === Share.dismissedAction) {
                      // dismissed
                    }
                  } catch (error) {
                    alert(error.message);
                  }
                } else {
                  if (url) Linking.openURL(url);
                }
                setVisible(false);
              }}
            >
              {item?.label}
            </MenuItem>
            <MenuDivider />
          </View>
        );
      })}
    </Menu>
  );
};
export default KebabMenu;
