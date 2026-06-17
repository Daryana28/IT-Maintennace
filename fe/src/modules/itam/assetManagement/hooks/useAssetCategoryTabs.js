// fe\src\modules\itam\assets\hooks\useAssetCategoryTabs.js
import {
 useMemo,
 useState,
} from "react";

export default function useAssetCategoryTabs() {
 const [lv1, setLv1] =
  useState("");

 const [lv2, setLv2] =
  useState("");

 const [lv3, setLv3] =
  useState("");

 const [lv4, setLv4] =
  useState("");

 const selectedCategory =
  useMemo(
   () =>
    lv4 ||
    lv3 ||
    lv2 ||
    lv1,
   [
    lv1,
    lv2,
    lv3,
    lv4,
   ]
  );

 return {
  lv1,
  lv2,
  lv3,
  lv4,
  setLv1,
  setLv2,
  setLv3,
  setLv4,
  selectedCategory,
 };
}