// 現在時刻を取得
export const getCurrentTime = (timezone: string = "ja-JP"): any => {
  const date = new Date();
  return { type: "text", value: date.toLocaleString(timezone) };
};

if (process.argv[1] === __filename) {
  console.log(getCurrentTime());
}
