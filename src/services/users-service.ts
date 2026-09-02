import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export async function registerUserService(dto: RegisterUserDto) {
  // Check if user with given email already exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, dto.email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // Hash password using Bun's native bcrypt password hashing
  const hashedPassword = await Bun.password.hash(dto.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Insert new user into database
  await db.insert(users).values({
    name: dto.name,
    email: dto.email,
    password: hashedPassword,
  });

  return { data: "OK" };
}

export async function loginUserService(dto: LoginUserDto) {
  // Find user by email
  const userList = await db
    .select()
    .from(users)
    .where(eq(users.email, dto.email))
    .limit(1);

  if (userList.length === 0) {
    throw new Error("Email atau password salah");
  }

  const user = userList[0];

  // Verify password using Bun's native password verify
  const isPasswordValid = await Bun.password.verify(dto.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  // Generate UUID token
  const token = crypto.randomUUID();

  // Save session to database
  await db.insert(sessions).values({
    token: token,
    userId: user.id,
  });

  return { data: token };
}
