import * as repo from "./hero-slide.repository";
import type { HeroPage } from "./hero-slide.repository";

export const listActifs = (page: HeroPage = "home") => repo.findActifs(page);
export const list       = (page?: HeroPage)          => repo.findAll(page);
export const getById    = (id: number)               => repo.findById(id);
export const create     = (data: any)                => repo.create(data);
export const update     = (id: number, data: any)    => repo.update(id, data);
export const remove     = (id: number)               => repo.remove(id);
export const reorder    = (ids: number[])            => repo.reorder(ids);