import * as React from "react";
import { useLocalSearchParams } from "expo-router";

import { ComponentScreen } from "../../components/ComponentScreen";

/**
 * Universal Link target — matches the docs URL `appcn.vercel.app/components/<slug>`
 * so a tapped link opens straight into the installed app's preview screen.
 */
export default function ComponentsSlug() {
  const { slug, fake } = useLocalSearchParams<{
    slug: string;
    fake?: string;
  }>();
  return <ComponentScreen slug={slug} fake={fake} />;
}
