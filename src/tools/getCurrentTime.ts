// 現在時刻を取得
export const getCurrentTime = (timezone: string = "ja-JP") => {
  const date = new Date();
  return date.toLocaleString(timezone);
}

if (process.argv[1] === __filename) {
  console.log(getCurrentTime());
}