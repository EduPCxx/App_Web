import { imageService } from '@/services/imageService';

const imagePayload = (productId, image, url) => ({
  entity_type: 'product',
  entity_id: productId,
  url,
  alt_text: image.alt_text || '',
  sort_order: image.sort_order,
  is_primary: false
});

export async function syncProductImages(productId, originalImages, draftImages) {
  const keptIds = new Set(draftImages.filter((image) => image._id).map((image) => image._id));
  const removedImages = originalImages.filter((image) => !keptIds.has(image._id));
  await Promise.all(removedImages.map((image) => imageService.remove(image._id)));

  await Promise.all(
    draftImages
      .filter((image) => image._id)
      .map((image) => imageService.update(image._id, { ...imagePayload(productId, image, image.url), is_primary: false }))
  );

  const savedImages = [];
  for (const [index, image] of draftImages.entries()) {
    const orderedImage = { ...image, sort_order: index };
    const saved = image._id
      ? { ...image, sort_order: index }
      : await imageService.create(imagePayload(productId, orderedImage, image.url));
    savedImages.push({ ...saved, clientId: image.clientId || image._id });
  }

  const primaryDraft = draftImages.find((draft) => draft.is_primary);
  const primaryClientId = primaryDraft?.clientId || primaryDraft?._id;
  const primaryImage = savedImages.find((image) => image.clientId === primaryClientId);
  if (primaryImage) await imageService.update(primaryImage._id, { is_primary: true });
}
