import React, { useLayoutEffect, useState } from "react";
import { View } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSWRConfig } from "swr";

import { HeaderRight } from "components/Header/Header";
import OfflineBar from "components/OfflineBar";
import FilterList from "components/FilterList";
import { ListFAB, GroupAndCustomFAB } from "components/FAB";
import {
  PostItem,
  PostItemSkeleton,
  PostItemHidden,
} from "components/Post/PostItem/index";

import useFilter from "hooks/use-filter";
import useI18N from "hooks/use-i18n";
import useList from "hooks/use-list";
import useNetwork from "hooks/use-network";
import useType from "hooks/use-type";
import useStyles from "hooks/use-styles";

import { getPostsFetcher } from "helpers";

import { labelize } from "utils";
import {
  ARROW_DEFINITIONS,
  QUESTIONNAIRE,
  REFLECTION,
  TypeConstants,
} from "constants";
import useMyUser from "hooks/use-my-user";

//import { localStyles } from "./ListScreen.styles";

const renderItem = ({ item }) => <PostItem item={item} />;
//const renderHiddenItem = ({ item }) => <PostItemHidden item={item} />;

// TODO: mock search bar, filter tags, FAB, etc..
const ListSkeleton = () =>
  Array(10)
    .fill(null)
    .map((_, ii) => <PostItemSkeleton key={ii} />);

const ListScreen = ({ navigation, route }) => {
  const tabBarHeight = useBottomTabBarHeight();
  const { mutate } = useSWRConfig();
  const { globalStyles } = useStyles();
  const { isConnected } = useNetwork();
  const { i18n } = useI18N();
  const { postType } = useType();
  const { defaultFilter, filter, onFilter, search, onSearch } = useFilter();

  const [refreshing, setRefreshing] = useState(false);

  const { data: items } = useList({ search, filter });
  const { data: userData } = useMyUser();

  let role = Object.values(userData?.profile?.roles ?? {})?.[0] ?? "";
  // TODO: handler error case?

  useLayoutEffect(() => {
    let title = labelize(postType) ?? "";
    if (postType === QUESTIONNAIRE) {
      title = REFLECTION;
    }
    const kebabItems = [
      {
        label: i18n.t("global.viewOnWeb"),
        urlPath: `${postType}`,
      },
      {
        label: i18n.t("global.documentation"),
        url: `https://disciple.tools/user-docs/disciple-tools-mobile-app/how-to-use/list-screens/#${postType}-screen`,
      },
      {
        label: ARROW_DEFINITIONS,
        showArrowDefinitions: true,
      },
    ];
    navigation.setOptions({
      title,
      headerRight: (props) => <HeaderRight kebabItems={kebabItems} props />,
    });
  }, [postType]);

  /*
   * only favorites are auto-refreshed on app launch, so this manual refresh
   * is the mechanism by which a user may refresh the list of posts
   */
  const onRefresh = async () => {
    if (isConnected) {
      setRefreshing(true);
      const { url, fetcher } = getPostsFetcher({ postType });
      await mutate(url, fetcher);
      setRefreshing(false);
    }
  };

  if (!items) return <ListSkeleton />;
  return (
    <>
      <View style={[globalStyles.container(tabBarHeight)]}>
        <OfflineBar />
        <FilterList
          isFlashList
          display
          sortable
          items={items}
          renderItem={renderItem}
          //renderHiddenItem={renderHiddenItem}
          keyExtractor={(item) => item?.ID?.toString()}
          search={search}
          onSearch={onSearch}
          defaultFilter={defaultFilter}
          filter={filter}
          onFilter={onFilter}
          refreshing={refreshing}
          onRefresh={onRefresh}
          //leftOpenValue={Constants.SWIPE_BTN_WIDTH * Constants.NUM_SWIPE_BUTTONS_LEFT}
          //rightOpenValue={Constants.SWIPE_BTN_WIDTH * Constants.NUM_SWIPE_BUTTONS_RIGHT}
          role={role}
        />
      </View>
      {postType === TypeConstants.CONTACT ? <ListFAB /> : <GroupAndCustomFAB />}
      {/* <ListFAB /> */}
    </>
  );
};
export default ListScreen;
