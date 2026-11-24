import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { useGate } from "@statsig/react-bindings";
import * as configcat from "configcat-js";
import { flags } from "./flags";

const client = configcat.getClient("key");

export function App({ region }: { region: string }) {
  const growth = useFeatureIsOn("ts-growth");
  const { value: gate } = useGate("ts-gate");
  const banner = import.meta.env.VITE_FEATURE_TS_BANNER === "true";
  const regional = flags.isEnabled(`ts-region-${region}`);
  void client.getValueAsync("ts-configcat", false);
  return <div>{String(growth && gate && banner && regional)}</div>;
}
