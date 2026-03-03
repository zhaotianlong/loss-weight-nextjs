const fs = require('fs');
const path = require('path');

const MOCK_DATA_DIR = path.join(__dirname, '../src/mock/data');
const OUTPUT_FILE = path.join(__dirname, 'seed_data.sql');

// 映射 Mock 文件到数据库表
const FILE_TABLE_MAP = {
    'camp.ts': 'camps',
    'employee.ts': 'employees',
    'campRoomType.ts': 'room_types',
    'student.ts': 'students',
    'privateCourse.ts': 'private_course_configs',
    'course.ts': 'public_courses',
    'room.ts': 'rooms',
    'bed.ts': 'beds',
    'tuition.ts': 'tuition',
    'recipe.ts': 'recipes',
    'coachStudent.ts': 'coach_student_relations',
    'stuPrivateOrders.ts': 'stu_private_orders',
    'stuPrivateRecord.ts': 'stu_class_records',
    'stuBodyData.ts': 'stu_body_data',
    'performance.ts': 'performance_goals',
    'campFeeStandard.ts': 'camp_fee_standards',
    'commissionStrategy.ts': 'commission_strategies',
    'duty.ts': 'duties',
    'facility.ts': 'facilities',
    'renewal.ts': 'renewals',
    'salary.ts': 'salaries',
    'studentCheckin.ts': 'student_checkins'
};

// 驼峰转下划线
function camelToSnake(str) {
    // 特殊转换
    if (str === 'id') return 'id'; // 保持主键 id
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// 处理 SQL 值
function formatSqlValue(value) {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'string') {
        // 如果是日期格式
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            return `'${value}'`;
        }
        return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'object') {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
    }
    return value;
}

// 从 TS 文件中提取数据数组
function extractArrayFromTs(content) {
    // 寻找 export const xxx = [ 或者 export const xxx: Type[] = [
    const match = content.match(/export const \w+(?::\s*[^=]+)?\s*=\s*\[/);
    if (!match) return null;
    
    const startIdx = match.index + match[0].length - 1; // [ 的位置
    
    let balance = 0;
    let endIdx = -1;
    for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '[') balance++;
        if (content[i] === ']') {
            balance--;
            if (balance === 0) {
                endIdx = i;
                break;
            }
        }
    }
    
    if (endIdx === -1) return null;
    
    let arrayStr = content.substring(startIdx, endIdx + 1);
    
    // 清理数据：移除类型转换（如 as any）、末尾逗号等
    // 注意：不能简单用正则移除 //，因为 URL 中包含 //
    let cleanedStr = arrayStr
        .replace(/as \w+/g, '') // 移除 as any 等
        .replace(/,(\s*[\]}])/g, '$1'); // 移除尾随逗号
        
    try {
        // 使用 eval 并包装在括号中，强制作为表达式解析
        return eval(`(${cleanedStr})`);
    } catch (e) {
        // 如果失败，尝试移除明显的单行注释（排除 URL）
        try {
            const lines = arrayStr.split('\n').map(line => {
                const commentIdx = line.indexOf('//');
                if (commentIdx !== -1) {
                    // 检查 // 是否在引号内（简单判断）
                    const quoteIdx = line.indexOf("'");
                    const doubleQuoteIdx = line.indexOf('"');
                    if (quoteIdx !== -1 && quoteIdx < commentIdx) return line;
                    if (doubleQuoteIdx !== -1 && doubleQuoteIdx < commentIdx) return line;
                    return line.substring(0, commentIdx);
                }
                return line;
            });
            return eval(`(${lines.join('\n')})`);
        } catch (e2) {
            console.error('解析数组失败:', e.message);
            return null;
        }
    }
}

// 字段名映射，用于查重
const UNIQUE_COL_MAP = {
    'camps': 'campId',
    'employees': 'empId',
    'room_types': 'roomTypeId',
    'rooms': 'roomId',
    'beds': 'bedId',
    'students': 'stuId',
    'private_course_configs': 'courseId',
    'public_courses': 'courseId',
    'stu_private_orders': 'orderId',
    'stu_class_records': 'recordId'
};

function generateInsertSql(tableName, dataArray) {
    if (!dataArray || dataArray.length === 0) return '';

    // 收集所有记录中出现过的字段并集
    const allKeys = [...new Set(dataArray.flatMap(item => Object.keys(item)))];
    const columns = allKeys.map(camelToSnake);
    
    const sqlHeader = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`;
    
    // 业务去重逻辑
    const uniqueCol = UNIQUE_COL_MAP[tableName];
    const seen = new Set();
    const filteredData = uniqueCol ? dataArray.filter(item => {
        const val = item[uniqueCol];
        if (val && seen.has(val)) return false;
        seen.add(val);
        return true;
    }) : dataArray;

    if (filteredData.length === 0) return '';

    const rows = filteredData.map(item => {
        const values = allKeys.map(key => formatSqlValue(item[key]));
        return `(${values.join(', ')})`;
    });

    return `${sqlHeader}${rows.join(',\n')};\n\n`;
}

async function migrate() {
    console.log('开始全面分析并迁移 Mock 数据...');
    let finalSql = '-- 自动生成的全量数据种子文件\n';
    finalSql += '-- 生成时间: ' + new Date().toLocaleString() + '\n\n';
    finalSql += 'BEGIN;\n\n';
    
    // 临时禁用外键检查以提高成功率
    finalSql += 'SET CONSTRAINTS ALL DEFERRED;\n\n';

    const orderOfMigration = [
        'camp.ts',
        'employee.ts',
        'campRoomType.ts',
        'student.ts',
        'privateCourse.ts',
        'course.ts',
        'room.ts',
        'bed.ts',
        'tuition.ts',
        'recipe.ts',
        'coachStudent.ts',
        'stuPrivateOrders.ts',
        'stuPrivateRecord.ts',
        'stuBodyData.ts',
        'performance.ts',
        'campFeeStandard.ts',
        'commissionStrategy.ts',
        'duty.ts',
        'facility.ts',
        'renewal.ts',
        'salary.ts',
        'studentCheckin.ts'
    ];

    for (const fileName of orderOfMigration) {
        const filePath = path.join(MOCK_DATA_DIR, fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`跳过不存在的文件: ${fileName}`);
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        let data = extractArrayFromTs(content);
        
        // 特殊处理员工密码
        if (fileName === 'employee.ts' && data) {
            const userAccountsPath = path.join(MOCK_DATA_DIR, 'userAccounts.ts');
            if (fs.existsSync(userAccountsPath)) {
                const uaContent = fs.readFileSync(userAccountsPath, 'utf8');
                const uaMatch = uaContent.match(/export const userAccounts = ({[\s\S]*?});/);
                if (uaMatch) {
                    try {
                        // 使用简单正则或 eval 提取
                        const userAccounts = eval(`(${uaMatch[1]})`);
                        data = data.map(emp => ({
                            ...emp,
                            password: userAccounts[emp.empId] ? userAccounts[emp.empId].password : null
                        }));
                    } catch (e) {
                        console.error('解析 userAccounts 失败:', e.message);
                    }
                }
            }
        }
        
        if (data && Array.isArray(data)) {
            const tableName = FILE_TABLE_MAP[fileName];
            if (tableName) {
                finalSql += `-- 数据来源: ${fileName} -> 表: ${tableName}\n`;
                finalSql += generateInsertSql(tableName, data);
                console.log(`成功处理: ${fileName} -> ${tableName} (${data.length} 条)`);
            }
        } else {
            console.error(`无法从 ${fileName} 提取有效数组数据`);
        }
    }

    finalSql += 'COMMIT;\n';
    fs.writeFileSync(OUTPUT_FILE, finalSql);
    console.log(`\n迁移脚本执行完毕！请运行: psql -f scripts/seed_data.sql`);
}

migrate();
