import React, { useState, useLayoutEffect, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
//import { useIsFocused } from "@react-navigation/native";

import { decode } from "html-entities";

import {
  ReadIcon,
  ReadAllIcon,
  UnreadIcon,
  CommentIcon,
  CommentAlertIcon,
  MentionIcon,
} from "components/Icon";
import { HeaderRight } from "components/Header/Header";
import OfflineBar from "components/OfflineBar";
import FilterList from "components/FilterList";
import PostItemSkeleton from "components/Post/PostItem/PostItemSkeleton";

import useFilter from "hooks/use-filter";
import useHaptics from "hooks/use-haptics";
import useI18N from "hooks/use-i18n";
//import useMyUser from 'hooks/use-my-user.js';
import useNotifications from "hooks/use-notifications";
import useStyles from "hooks/use-styles";
import useType from "hooks/use-type";
import useMyUser from "hooks/use-my-user";

import { NotificationActionConstants, ScreenConstants } from "constants";

import { parseDateShort, truncate } from "utils";

import { localStyles } from "./NotificationsScreen.styles";
import { ARROW_DEFINITIONS } from "constants";
import { TouchableOpacity } from "react-native";
import { REGISTERED } from "constants";

const NotificationsScreen = ({ navigation }) => {
  // TODO: constant
  const DEFAULT_LIMIT = 1000;

  const { vibrate } = useHaptics();
  const { i18n } = useI18N();
  const tabBarHeight = useBottomTabBarHeight();
  const { styles, globalStyles } = useStyles(localStyles);
  const { getTabScreenFromType } = useType();

  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { defaultFilter, filter, onFilter, search, onSearch } = useFilter();
  const { data: userData } = useMyUser();

  let role = Object.values(userData?.profile?.roles ?? {})?.[0] ?? "";

  // console.log("--filter--", filter);

  const {
    data: notifications,
    error,
    isLoading,
    isValidating,
    mutate,
    hasNotifications,
    //markViewed,
    //markUnread,
    markAllViewed,
    markNotificationViewed,
    markNotificationUnread,
  } = useNotifications({ search, filter, offset, limit });

  const [items, setItems] = useState();

  useEffect(() => {
    setItems(notifications);
  }, [hasNotifications, search, filter?.ID]);

  // TODO: custom useHeaderLayoutEffect hook for reuse
  useLayoutEffect(() => {
    const kebabItems = [
      {
        label: i18n.t("global.viewOnWeb"),
        urlPath: "notifications",
      },
      {
        label: i18n.t("global.documentation"),
        url: "https://disciple.tools/user-docs/disciple-tools-mobile-app/how-to-use/notifications-screen/",
      },
      {
        label: ARROW_DEFINITIONS,
        showArrowDefinitions: true,
      },
    ];
    navigation.setOptions({
      title: i18n.t("global.notifications"),
      headerRight: (props) => {
        return (
          <View style={globalStyles.rowContainer}>
            <TouchableOpacity onPress={() => _markAllViewed()}>
              <ReadAllIcon
                style={styles.readAllIcon(hasNotifications)}
                // onPress={() => _markAllViewed()}
              />
            </TouchableOpacity>
            <HeaderRight kebabItems={kebabItems} props />
          </View>
        );
      },
    });
  });

  const _markAllViewed = () => {
    if (role === REGISTERED) {
      return;
    }
    // console.log("--_markAllViewed--");
    vibrate();
    // return;
    let newItems = items.map((item) => ({ ...item, is_new: "0" }));
    // TODO: why delay?
    setTimeout(() => {
      mutate();
    }, 1000);
    // mutate();
    // component state
    setItems(newItems);
    // TODO
    // in-memory cache state
    // remote API state
    markAllViewed();
  };

  const NotificationItem = ({ item, loading, mutate }) => {
    const [isNew, setIsNew] = useState(item?.is_new === "1" ? true : false);
    // Roger modified contact details on <a href="https://arrowappstage.wpengine.com/contacts/121">Parah Contact700zz</a>.

    if (!item || loading) return <PostItemSkeleton />;
    const str1 = item?.notification_note?.search("<");
    const str2 = item?.notification_note?.search(">");
    const str3 = item?.notification_note?.length - 4;
    const newNotificationNoteA = item?.notification_note?.substr(0, str1);
    // console.log("--item?.notification_note--", item?.notification_note);
    // console.log("--newNotificationNoteA--", newNotificationNoteA);
    const newNotificationNoteB = item?.notification_note?.substr(str2, str3);
    // console.log("--newNotificationNoteB--", newNotificationNoteB);
    const str4 = newNotificationNoteB?.search("<") - 1;
    const newNotificationNoteC = newNotificationNoteB?.substr(1, str4);
    // console.log("--newNotificationNoteC--", newNotificationNoteC);
    let entityLink = item?.notification_note?.substring(
      item?.notification_note?.lastIndexOf('href="') + 6,
      item?.notification_note?.lastIndexOf('">')
    );
    let id = entityLink?.split("/")[4];
    let type = entityLink?.split("/")[3];

    const name = item?.notification_name;
    const action = item?.notification_action;

    const NotificationIcon = () => {
      const renderIcon = () => {
        if (item?.notification_action == NotificationActionConstants.COMMENT)
          return <CommentIcon />;
        if (item?.notification_action == NotificationActionConstants.ALERT)
          return <CommentAlertIcon />;
        if (item?.notification_action == NotificationActionConstants.MENTION)
          return <MentionIcon />;
        return null;
      };
      return (
        <View style={[globalStyles.rowIcon, styles.startIcon]}>
          {renderIcon()}
        </View>
      );
    };

    const NotificationDetails = () => (
      <View style={globalStyles.columnContainer}>
        <View style={[globalStyles.rowContainer, styles.notificationDetails]}>
          <Text>{truncate(decode(newNotificationNoteA))}</Text>
          <Pressable
            onPress={() => {
              const tabScreen = getTabScreenFromType(type);
              navigation.jumpTo(tabScreen, {
                screen: ScreenConstants.DETAILS,
                id,
                name: item?.post_title,
                type,
              });
            }}
          >
            <Text style={globalStyles.link}>
              {truncate(decode(newNotificationNoteC))}
            </Text>
          </Pressable>
        </View>
        <View>
          {item?.pretty_time?.[0] ? (
            <Text style={globalStyles.caption}>
              {item.pretty_time[0]}
              {item.pretty_time?.[1] ? `, ${item.pretty_time[1]}` : ""}
            </Text>
          ) : (
            <Text style={globalStyles.caption}>
              {parseDateShort(item?.date_notified)}
            </Text>
          )}
        </View>
      </View>
    );

    const _markViewed = ({ id }) => {
      // component state
      setIsNew(false);
      // in-memory cache state
      // TODO:
      // remote API state
      markNotificationViewed({ notificationId: id });
      return;
    };

    const _markUnread = ({ id }) => {
      // component state
      setIsNew(true);
      // TODO:
      // in-memory cache state
      // remote API state
      markNotificationUnread({ notificationId: id });
      return;
    };

    const NotificationButton = () => (
      <Pressable
        onPress={() => {
          vibrate();
          const id = item?.id;
          if (id) {
            if (isNew) {
              _markViewed({ id });
              return;
            }
            _markUnread({ id });
            return;
          }
        }}
        style={[globalStyles.rowIcon, styles.markIcon]}
      >
        {isNew ? (
          <UnreadIcon />
        ) : (
          <ReadIcon style={globalStyles.selectedIcon} />
        )}
      </Pressable>
    );

    return (
      <View style={[globalStyles.rowContainer, styles.container(isNew)]}>
        <View
          style={{
            flex: 1,
          }}
        >
          <NotificationIcon />
        </View>
        <View
          style={{
            flex: 6,
          }}
        >
          <NotificationDetails />
        </View>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
          }}
        >
          <NotificationButton />
        </View>
      </View>
    );
  };

  // NOTE: wrap in empty view, otherwise `react-native-swipe-view` requires React.forwardRef
  const renderItem = ({ item }) => (
    <>
      <NotificationItem item={item} loading={isLoading} mutate={mutate} />
    </>
  );

  // TODO: reusable component
  const ListSkeleton = () =>
    Array(10)
      .fill(null)
      .map((_, ii) => <PostItemSkeleton key={ii} />);

  if (!items) return <ListSkeleton />;
  return (
    <View style={[globalStyles.container(tabBarHeight)]}>
      <OfflineBar />
      <FilterList
        display
        //sortable
        items={items}
        renderItem={renderItem}
        //renderHiddenItem={renderHiddenItem}
        keyExtractor={(item) => item?.id}
        search={search}
        onSearch={onSearch}
        defaultFilter={defaultFilter}
        filter={filter}
        onFilter={onFilter}
        onRefresh={mutate}
        //leftOpenValue={Constants.SWIPE_BTN_WIDTH * Constants.NUM_SWIPE_BUTTONS_LEFT}
        //rightOpenValue={Constants.SWIPE_BTN_WIDTH * Constants.NUM_SWIPE_BUTTONS_RIGHT}
        role={role}
      />
    </View>
  );
};
export default NotificationsScreen;
