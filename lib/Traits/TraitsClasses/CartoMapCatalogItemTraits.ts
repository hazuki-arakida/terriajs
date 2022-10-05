import { JsonObject } from "../../Core/Json";
import anyTrait from "../Decorators/anyTrait";
import primitiveTrait from "../Decorators/primitiveTrait";
import mixTraits from "../mixTraits";
import CatalogMemberTraits from "./CatalogMemberTraits";
import LayerOrderingTraits from "./LayerOrderingTraits";
import LegendOwnerTraits from "./LegendOwnerTraits";
import MappableTraits from "./MappableTraits";
import ImageryProviderTraits from "./ImageryProviderTraits";
import UrlTraits from "./UrlTraits";
import FeatureInfoUrlTemplateTraits from "./FeatureInfoTraits";

export default class CartoMapCatalogItemTraits extends mixTraits(
  ImageryProviderTraits,
  LayerOrderingTraits,
  UrlTraits,
  MappableTraits,
  FeatureInfoUrlTemplateTraits,
  CatalogMemberTraits,
  LegendOwnerTraits
) {
  @anyTrait({
    name: "Config",
    description: "The configuration information to pass to the Carto Maps API"
  })
  config?: JsonObject | string;

  @primitiveTrait({
    type: "string",
    name: "Authorization token",
    description: "The authorization token to pass to the Carto Maps API"
  })
  auth_token?: string;
}
