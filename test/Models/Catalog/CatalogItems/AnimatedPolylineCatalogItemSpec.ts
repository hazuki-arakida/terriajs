import { autorun, runInAction, when } from "mobx";
import AnimatedPolylineCatalogItem from "../../../../lib/Models/Catalog/CatalogItems/AnimatedPolylineCatalogItem";
import Terria from "../../../../lib/Models/Terria";
import { isCesium3DTileset } from "../../../../lib/ModelMixins/MappableMixin";

describe("AnimatedPolylineCatalogItem", function () {
  let item: AnimatedPolylineCatalogItem;
  let terria: Terria;
  const testUrl = "test/AnimatedPolyline/yurakucho.json";
  beforeEach(async function () {
    terria = new Terria();
    item = new AnimatedPolylineCatalogItem("test", terria, undefined);
    const container = document.createElement("div");
    terria.mainViewer.attach(container);
    await (terria.mainViewer as any)._cesiumPromise;
  });
  it("prevents cesium render loop from being paused", async function () {
    await when(() => terria.currentViewer.type === "Cesium");
    if (terria.cesium) {
      const initialTweenCount = terria.cesium.scene.tweens.length;
      const dispose = autorun(() => {
        item.mapItems.forEach(() => {});
      });
      expect(terria.cesium?.scene.tweens.length).toEqual(initialTweenCount + 1);
      dispose();
      expect(terria.cesium?.scene.tweens.length).toEqual(initialTweenCount);
    } else {
      fail(`terria.cesium is ${terria.cesium}`);
    }
  });
  describe("mapItems", function () {
    beforeEach(async function () {
      runInAction(() => {
        item.setTrait("definition", "url", testUrl);
      });
      await item.loadMapItems();
    });
    it("can load data by url", async function () {
      expect(item.trajectories.length).toEqual(1);
    });
    it("sets show", function () {
      expect(item.mapItems.length).toBe(1);
      runInAction(() => {
        item.setTrait("definition", "show", false);
      });
      expect(item.mapItems.length).toEqual(0);
    });
  });
});
