import { logAudit } from "../../lib/audit";
import { tutorialVideoRepository } from "./tutorial-video.repository";
import type { TutorialVideoDto, TutorialVideoQueryDto, UpdateTutorialVideoDto } from "./tutorial-video.schema";

export const tutorialVideoService = {
  listPublic(page: string) {
    return tutorialVideoRepository.listPublic(page);
  },

  list(params: TutorialVideoQueryDto) {
    return tutorialVideoRepository.list(params);
  },

  async getById(id: number) {
    const video = await tutorialVideoRepository.findById(id);
    if (!video) throw { status: 404, message: "Vidéo introuvable" };
    return video;
  },

  async create(data: TutorialVideoDto, id_admin: number) {
    const video = await tutorialVideoRepository.create(data);
    await logAudit({ id_admin, action: "CREATE", entity_name: "tutorial_video", entity_id: video.id_video });
    return video;
  },

  async update(id: number, data: UpdateTutorialVideoDto, id_admin: number) {
    await tutorialVideoService.getById(id);
    const video = await tutorialVideoRepository.update(id, data);
    await logAudit({ id_admin, action: "UPDATE", entity_name: "tutorial_video", entity_id: id });
    return video;
  },

  async delete(id: number, id_admin: number) {
    await tutorialVideoService.getById(id);
    await tutorialVideoRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "tutorial_video", entity_id: id });
  },
};
