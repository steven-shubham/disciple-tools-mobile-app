import { ThemeConstants } from "constants";
import * as colors from "constants/colors";

export const localStyles = ({ theme, isRTL, isIOS }) => ({
  container: {
    marginHorizontal: 5,
    paddingHorizontal: 8,
    paddingBottom: 30,
    backgroundColor: theme.mode === ThemeConstants.DARK ? "#707070" : null,
  },
  bulletTextBold: { fontWeight: "700" },
  bullet: {
    marginRight: 10,
    marginTop: 4,
    color: theme.mode === ThemeConstants.DARK ? "white" : "black",
  },
  churchHealthIconContainer: {
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  churchHealthIconDescriptionContainer: {
    marginLeft: 10,
    marginRight: 20,
    width: "83%",
  },
  postTypeContainer: {
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    flex: 1,
    marginTop: 15,
  },
  postTypeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.mode === ThemeConstants.DARK ? "white" : "black",
  },
});
