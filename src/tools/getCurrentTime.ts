// 現在時刻を取得（デフォルトで日本のロケール）
export const getCurrentTime = (locale: string = "ja-JP"): any => {
  const date = new Date();
  return { type: "text", value: date.toLocaleString(locale) };
};

if (process.argv[1] === __filename) {
  console.log(getCurrentTime());
}
