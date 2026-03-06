import prisma from "./prisma";

export async function getSystemSettings() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      try {
        acc[setting.key] = JSON.parse(setting.value);
      } catch {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {});
    
    return settingsObj;
  } catch (error) {
    console.error("Error fetching settings helper:", error);
    return {};
  }
}
