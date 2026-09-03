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

  const user = userList[0];
  if (!user) {
    throw new Error("Email atau password salah");
  }

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

export async function getCurrentUserService(token: string) {
  const sessionList = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  const session = sessionList[0];
  if (!session) {
    throw new Error("Unauthorize");
  }

  const userList = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const user = userList[0];
  if (!user) {
    throw new Error("Unauthorize");
  }

  return {
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.createdAt,
    },
  };
}


