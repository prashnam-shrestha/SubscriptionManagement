export class UserPayloadDto {
  userId!: string;
  fullName!: string;
  email!: string;
  role!: string;
  status!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  user!: UserPayloadDto;
}