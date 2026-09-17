import {
  BackSide,
  BufferGeometry,
  ColorRepresentation,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshToonMaterial,
  NearestFilter,
  RedFormat,
  UnsignedByteType,
} from 'three';

const gradient = new DataTexture(
  new Uint8Array([70, 165, 255]),
  3,
  1,
  RedFormat,
  UnsignedByteType,
);
gradient.minFilter = NearestFilter;
gradient.magFilter = NearestFilter;
gradient.needsUpdate = true;

export function makeMesh(
  geometry: BufferGeometry,
  color: ColorRepresentation,
  toon: boolean,
): Mesh {
  const material = toon
    ? new MeshToonMaterial({ color, gradientMap: gradient })
    : new MeshLambertMaterial({ color });
  const mesh = new Mesh(geometry, material);

  if (toon) {
    const outline = new Mesh(
      geometry,
      new MeshBasicMaterial({ color: 0x171717, side: BackSide }),
    );
    outline.scale.setScalar(1.03);
    outline.renderOrder = -1;
    mesh.add(outline);
  }

  return mesh;
}
