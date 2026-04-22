type SearchValue = string | string[] | undefined;
type SearchParams = Record<string, SearchValue>;

type FeedbackMap = {
  saved?: Record<string, string>;
  error?: Record<string, string>;
};

const pickValue = (value: SearchValue) => (Array.isArray(value) ? value[0] : value);

export const resolvePanelFeedback = async (
  searchParams: Promise<SearchParams> | undefined,
  messages: FeedbackMap
) => {
  const params = searchParams ? await searchParams : {};
  const saved = pickValue(params.saved);
  const error = pickValue(params.error);

  if (error && messages.error?.[error]) {
    return {
      tone: "critical" as const,
      message: messages.error[error]
    };
  }

  if (saved && messages.saved?.[saved]) {
    return {
      tone: "success" as const,
      message: messages.saved[saved]
    };
  }

  return null;
};
