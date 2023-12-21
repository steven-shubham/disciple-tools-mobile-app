import useComments from "hooks/use-comments";
import useActivity from "hooks/use-activity";
import useFilter from "hooks/use-filter";

const useCommentsActivity = ({ search, filter, exclude, postId }) => {
  // console.log("--useCommentsActivity filter--", filter);
  const { filterByKey, sortByKey } = useFilter();
  // console.log("--useCommentsActivity postId--", postId);
  let {
    cacheKey,
    data: comments,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useComments({ search, exclude, postId });
  const {
    data: activity,
    error: errorActivity,
    isLoading: isLoadingActivity,
    isValidating: isValidatingActivity,
  } = useActivity({ search, filter, exclude, postId });

  // console.log("--comments--", comments.length);
  // console.log("--activity--", activity.length);

  if (isLoadingActivity || isLoading || !comments || !activity)
    return {
      data: [],
      error: errorActivity || error,
      isLoading: isLoadingActivity || isLoading,
      isValidating: isValidatingActivity || isValidating,
      mutate,
    };
  let merged = [];
  const sortKey = "hist_time";
  if (comments) {
    comments.forEach((comment) => {
      try {
        comment[sortKey] =
          Date.parse(comment?.comment_date_gmt.replace(" ", "T")) / 1000;
      } catch (error) {
        comment[sortKey] = -1;
      }
    });
    merged.push(...comments);
  }
  if (activity) merged.push(...activity);
  //if (filter?.query?.key && filter?.query?.value) merged = merged.filter(item => item?.[filter.query.key] === filter.query.value);
  // NOTE: filter by key existence per "useFilters" query value
  if (filter?.query?.key)
    merged = merged.filter((item) => item.hasOwnProperty(filter.query.key));
  merged.sort((a, b) => b[sortKey] - a[sortKey]);
  return {
    cacheKey,
    data: merged,
    error: null,
    isLoading: null,
    isValidating: null,
    mutate,
  };
};
export default useCommentsActivity;
