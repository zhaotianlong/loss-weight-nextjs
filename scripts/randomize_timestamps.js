const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../src/mock/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && !['userAccounts.ts', 'phoneToEmpId.ts', 'renewal.ts'].includes(f));

function randomTime(start, end) {
  const startTime = start.getTime();
  const endTime = end.getTime();
  // 确保 start <= end
  if (startTime > endTime) return new Date(startTime);
  
  const diff = endTime - startTime;
  const randomDiff = Math.random() * diff;
  return new Date(startTime + randomDiff);
}

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`Processing ${file}...`);

  const arrayStartRegex = /export const \w+ = \[\s*/;
  const match = content.match(arrayStartRegex);
  if (!match) return;
  
  const startIndex = match.index + match[0].length;
  const endIndex = content.lastIndexOf('];');
  if (endIndex === -1) return;
  
  let arrayContent = content.substring(startIndex, endIndex);
  const prefix = content.substring(0, startIndex);
  const suffix = content.substring(endIndex);
  
  const now = new Date();
  
  // 匹配 "createTime": "...", "updateTime": "..."
  // 允许中间有空白字符（包括换行）
  let newArrayContent = arrayContent.replace(
    /("createTime": ")([^"]+)("),\s*("updateTime": ")([^"]+)(")/g,
    (match, p1, oldCreateTime, p3, p4, oldUpdateTime, p6, offset, fullString) => {
        // 获取上下文（前500个字符）
        const context = fullString.substring(Math.max(0, offset - 500), offset);
        
        let baseDate = new Date();
        let daysAgo = 365; // 默认一年前
        let isBasedOnBusinessDate = false;
        
        // 1. 尝试匹配 createDate (camp)
        const createDateMatch = context.match(/"createDate":\s*"(\d{4}-\d{2}-\d{2})"/);
        if (createDateMatch) {
            baseDate = new Date(createDateMatch[1]);
            // createTime 是 createDate 当天的 09:00 - 18:00
            baseDate.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60));
            daysAgo = 0;
            isBasedOnBusinessDate = true;
        } else {
            // 2. 尝试匹配 checkinDate (student)
            const checkinDateMatch = context.match(/"checkinDate":\s*"(\d{4}-\d{2}-\d{2})"/);
            if (checkinDateMatch) {
                const checkin = new Date(checkinDateMatch[1]);
                // 报名时间通常在入营前 7-60 天
                daysAgo = 7 + Math.floor(Math.random() * 53);
                baseDate = checkin;
                isBasedOnBusinessDate = true;
            }
        }
        
        // 生成 createTime
        let createTime;
        if (daysAgo === 0 && isBasedOnBusinessDate) {
             createTime = baseDate;
        } else {
             // 如果不是基于业务日期，就在过去 1 年内随机
             // 如果是基于 checkinDate，就是 checkinDate - daysAgo
             if (isBasedOnBusinessDate) {
                 createTime = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
                 createTime.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60));
             } else {
                 // 默认情况：过去 2 年内
                 createTime = new Date(now.getTime() - Math.random() * 730 * 24 * 60 * 60 * 1000);
             }
        }
        
        // 修正：如果 createTime 在未来，强制设为现在之前
        if (createTime > now) {
            createTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        }
        
        // 生成 updateTime
        // 80% 的概率 updateTime = createTime (没有更新)
        // 20% 的概率 updateTime > createTime
        let updateTime;
        if (Math.random() > 0.8) {
            updateTime = randomTime(createTime, now);
        } else {
            updateTime = createTime;
        }
        
        return `"createTime": "${createTime.toISOString()}", "updateTime": "${updateTime.toISOString()}"`;
    }
  );
  
  if (newArrayContent !== arrayContent) {
      fs.writeFileSync(filePath, prefix + newArrayContent + suffix, 'utf8');
      console.log(`Updated ${file}`);
  }
});
