import type { Metadata } from "next";
import { DefaultLogin } from "@/components/ConnectButtons/DefaultLogin";

export const metadata: Metadata = {
  title: "Nami | Donate",
  description:
    "An autonomous agent that discovers global human disasters, collect donations and keeps NGO’s accountable",
};

export default function DonatePage() {
  return (
    <div>
      <h1>Hello</h1>
      <h2>World</h2>
      <h3>Hello</h3>
      <h4>World</h4>
      <h5>Hello</h5>
      <h6>World</h6>
      <p>Hello</p>
      <p>World</p>
      <DefaultLogin />
    </div>
  );
}
