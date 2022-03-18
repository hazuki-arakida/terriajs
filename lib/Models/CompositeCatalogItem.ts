import i18next from "i18next";
import { action, computed, runInAction, autorun } from "mobx";
import DeveloperError from "terriajs-cesium/Source/Core/DeveloperError";
import filterOutUndefined from "../Core/filterOutUndefined";
import isDefined from "../Core/isDefined";
import CatalogMemberMixin from "../ModelMixins/CatalogMemberMixin";
import CompositeCatalogItemTraits from "../Traits/CompositeCatalogItemTraits";
import ModelReference from "../Traits/ModelReference";
import MappableMixin, { MapItem } from "../ModelMixins/MappableMixin";
import CreateModel from "./CreateModel";
import { BaseModel } from "./Model";
import CommonStrata from "./CommonStrata";

export default class CompositeCatalogItem extends MappableMixin(
  CatalogMemberMixin(CreateModel(CompositeCatalogItemTraits))
) {
  static readonly type = "composite";

  private _visibilityDisposer = autorun(() => {
    this.syncVisibilityToMembers();
  });

  get type() {
    return CompositeCatalogItem.type;
  }

  get typeName() {
    return i18next.t("models.composite.name");
  }

  @computed
  get memberModels(): ReadonlyArray<BaseModel> {
    const members = this.members;
    if (members === undefined) {
      return [];
    }

    return filterOutUndefined(
      members.map(id =>
        ModelReference.isRemoved(id)
          ? undefined
          : this.terria.getModelById(BaseModel, id)
      )
    );
  }

  protected async forceLoadMetadata(): Promise<void> {
    await Promise.all(
      this.memberModels
        .filter(CatalogMemberMixin.isMixedInto)
        .map(model => model.loadMetadata())
    );
  }

  async forceLoadMapItems(): Promise<void> {
    await Promise.all(
      this.memberModels
        .filter(MappableMixin.isMixedInto)
        .map(model => model.loadMapItems())
    );
  }

  syncVisibilityToMembers() {
    this.strata.forEach((stratum, stratumId) => {
      const show = this.getTrait(stratumId, "show");
      this.memberModels.forEach(model => {
        model.setTrait(stratumId, "show", show);
      });
    });
  }

  @computed get mapItems() {
    const result: MapItem[] = [];
    this.memberModels.filter(MappableMixin.isMixedInto).forEach(model => {
      result.push(...model.mapItems);
    });
    return result;
  }

  @action
  add(stratumId: string, member: BaseModel) {
    if (member.uniqueId === undefined) {
      throw new DeveloperError(
        "A model without a `uniqueId` cannot be added to a composite."
      );
    }

    if (!isDefined(this.terria.getModelById(BaseModel, member.uniqueId))) {
      this.terria.addModel(member);
    }

    const members = this.getTrait(stratumId, "members");
    if (isDefined(members)) {
      members.push(member.uniqueId);
    } else {
      this.setTrait(stratumId, "members", [member.uniqueId]);
    }
  }

  dispose() {
    super.dispose();
    this._visibilityDisposer();
  }
}
