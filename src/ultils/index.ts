import { MethodNotAllowedException } from "@nestjs/common";
import { RoleEnum } from "src/common/enum/role.enum";

export const checkEmail = (email): boolean => {
  const reg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return reg.test(email)
}
export const checkCandidate = (user) => {
  if (user.role)
    throw new MethodNotAllowedException("bạn không pải candidate")
}

export const checkPlayer = (user): boolean => {
  if (user.role === RoleEnum.ADMIN)
    throw new MethodNotAllowedException("bạn không pải player")
  if (user.role === RoleEnum.HR)
    return false
  return true

}
export const timeRemainValid = (totalTime: number, timeStart: Date): number => {
  const now = new Date();
  const timeAnswer = now.getTime() - timeStart.getTime()
  return totalTime - timeAnswer / 1000;
}