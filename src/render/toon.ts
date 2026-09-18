import {
  BackSide,
  BufferGeometry,
  Color,
  ColorRepresentation,
  DataTexture,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  NearestFilter,
  Object3D,
  RedFormat,
  SkinnedMesh,
  Texture,
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

function sourceColor(material: Material): Color {
  if (
    material instanceof MeshBasicMaterial
    || material instanceof MeshLambertMaterial
    || material instanceof MeshStandardMaterial
    || material instanceof MeshToonMaterial
  ) {
    return material.color.clone();
  }
  return new Color(0xb8a78d);
}

function sourceMap(material: Material): Texture | null {
  if (
    material instanceof MeshBasicMaterial
    || material instanceof MeshLambertMaterial
    || material instanceof MeshStandardMaterial
    || material instanceof MeshToonMaterial
  ) {
    return material.map;
  }
  return null;
}

function flatMaterial(material: Material, toon: boolean, color?: ColorRepresentation): Material {
  const base = color === undefined ? sourceColor(material) : new Color(color);
  const map = color === undefined ? sourceMap(material) : null;
  const replacement = toon
    ? new MeshToonMaterial({ color: base, gradientMap: gradient, map })
    : new MeshLambertMaterial({ color: base, map });
  replacement.name = material.name;
  return replacement;
}

export function styleLoadedScene(
  root: Object3D,
  toon: boolean,
  color?: ColorRepresentation,
): void {
  const meshes: Mesh[] = [];
  root.traverse(object => {
    if (object instanceof Mesh) meshes.push(object);
  });

  for (const mesh of meshes) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const replacements = materials.map(material => flatMaterial(material, toon, color));
    mesh.material = Array.isArray(mesh.material) ? replacements : replacements[0];

    if (toon && !(mesh instanceof SkinnedMesh)) {
      const outline = new Mesh(
        mesh.geometry,
        new MeshBasicMaterial({ color: 0x171717, side: BackSide }),
      );
      outline.name = `${mesh.name || 'mesh'}-outline`;
      outline.scale.setScalar(1.025);
      outline.renderOrder = -1;
      mesh.add(outline);
    }
  }
}
