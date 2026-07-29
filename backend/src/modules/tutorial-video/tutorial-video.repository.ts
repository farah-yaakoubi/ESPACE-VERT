import { prisma } from "../../lib/prisma";
import type { TutorialVideoDto, TutorialVideoQueryDto, UpdateTutorialVideoDto } from "./tutorial-video.schema";

export const tutorialVideoRepository = {
  listPublic(page: string) {
    return prisma.tutorialVideo.findMany({
      where: { page, actif: true },
      orderBy: [{ ordre: "asc" }, { created_at: "desc" }],
    });
  },

  list(params: TutorialVideoQueryDto) {
    const where: any = { page: params.page };
    if (params.actif !== undefined) where.actif = params.actif === "true";
    return prisma.tutorialVideo.findMany({
      where,
      orderBy: [{ ordre: "asc" }, { created_at: "desc" }],
    });
  },

  findById(id_video: number) {
    return prisma.tutorialVideo.findUnique({ where: { id_video } });
  },

  create(data: TutorialVideoDto) {
    return prisma.tutorialVideo.create({ data });
  },

  update(id_video: number, data: UpdateTutorialVideoDto) {
    return prisma.tutorialVideo.update({ where: { id_video }, data });
  },

  delete(id_video: number) {
    return prisma.tutorialVideo.delete({ where: { id_video } });
  },
};
