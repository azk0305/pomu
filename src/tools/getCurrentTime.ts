// 現在時刻を取得（デフォルトで日本のロケール）

import dayjs from "dayjs";
import * as localeJa from "dayjs/locale/ja";

export const getCurrentTime = (): any => {
  dayjs.locale(localeJa);
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
};
