import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  View,
  Text,
} from "react-native";
import { ScrollView, FlatList } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";

import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import Placeholder from "components/Placeholder";

import useStyles from "hooks/use-styles";

import Constants from "constants";

import { localStyles } from "./FilterList.styles";
import Button from "components/Button";
import { REGISTERED } from "constants";

const FilterList = ({
  isFlashList,
  display,
  sortable,
  items,
  renderItem,
  renderHiddenItem,
  keyExtractor,
  search,
  onSearch,
  defaultFilter,
  filter,
  onFilter,
  refreshing,
  onRefresh,
  placeholder,
  leftOpenValue,
  rightOpenValue,
  onRowDidOpen,
  onRowDidClose,
  footer,
  style,
  postId,
  isTagField = false,
  selectedTags = [],
  _onChange = () => {},
  role = "",
}) => {
  const { styles, globalStyles } = useStyles(localStyles);
  // console.log("--FilterList postId--", postId);

  const [_refreshing, _setRefreshing] = useState(refreshing ?? false);

  const _onRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    _setRefreshing(true);
    setTimeout(() => {
      _setRefreshing(false);
    }, 1000);
  });

  const getItemLayout = useCallback(
    (data, index) => ({
      length: Constants.LIST_ITEM_HEIGHT,
      offset: Constants.LIST_ITEM_HEIGHT * index,
      index,
    }),
    []
  );
  const TagFieldHandler = () => {
    if (selectedTags.includes(search)) {
      return (
        <View style={styles.center}>
          <Text>Tag "{search}" is already being used.</Text>
        </View>
      );
    } else {
      return (
        <View style={{ width: "60%", alignSelf: "center" }}>
          <Button
            title={`Add new tag "${search}"`}
            onPress={() => {
              _onChange(search);
            }}
          />
        </View>
      );
    }
  };

  // TODO: actual skeleton component for post lists
  if (!items) return <SafeAreaView style={styles.container} />;
  // console.log("--items, search--", items, search);
  return (
    <View style={[styles.container, style]}>
      {onSearch && role !== REGISTERED && (
        <SearchBar
          sortable={sortable}
          search={search}
          onSearch={onSearch}
          filter={filter}
          onFilter={onFilter}
        />
      )}
      {onFilter && role !== REGISTERED && (
        <FilterBar
          display={display}
          items={items}
          defaultFilter={defaultFilter}
          filter={filter}
          onFilter={onFilter}
          postId={postId}
        />
      )}
      {/* <SearchBar
        sortable={sortable}
        search={search}
        onSearch={onSearch}
        filter={filter}
        onFilter={onFilter}
      />
      <FilterBar
        display={display}
        items={items}
        defaultFilter={defaultFilter}
        filter={filter}
        onFilter={onFilter}
        postId={postId}
      /> */}
      {isFlashList ? (
        <FlashList
          keyExtractor={keyExtractor}
          data={items}
          renderItem={renderItem}
          ListEmptyComponent={<Placeholder placeholder={placeholder} />}
          refreshControl={
            <RefreshControl refreshing={_refreshing} onRefresh={_onRefresh} />
          }
          contentContainerStyle={globalStyles.screenGutter}
          // Performance settings
          getItemLayout={getItemLayout}
          estimatedItemSize={200}
        />
      ) : (
        <FlatList
          keyExtractor={keyExtractor}
          data={items}
          renderItem={renderItem}
          ListEmptyComponent={() => {
            // console.log("--FlatList--", items);
            if (isTagField) {
              return <TagFieldHandler />;
            } else {
              return <Placeholder placeholder={placeholder} />;
            }
          }}
          refreshControl={
            <RefreshControl refreshing={_refreshing} onRefresh={_onRefresh} />
          }
          contentContainerStyle={globalStyles.screenGutter}
          // Performance settings
          getItemLayout={getItemLayout}
          estimatedItemSize={200}
        />
      )}
      {refreshing && (
        <View style={globalStyles.activityIndicator}>
          <ActivityIndicator size="large" />
        </View>
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
};
export default FilterList;
