import Constants from "constants";

export const localStyles = ({ theme, isRTL, isIOS }) => ({
  container: {
    backgroundColor: theme.surface.primary,
    height: "100%",
  },
  gutter: {
    marginBottom: Constants.LIST_ITEM_HEIGHT,
  },
  skelton: {
    backgroundColor: theme.background.primary,
    height: "100%",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});
