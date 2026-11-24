export function splitSql(sql: string): string[] {
 const result: string[] = []; let current = '';
 for (const line of sql.split('\n')) {
  current += line + '\n';
  const trigger = /CREATE\s+TRIGGER/i.test(current);
  if (trigger ? /END;\s*$/.test(line) : /;\s*$/.test(line)) {
   result.push(current); current = '';
  }
 }
 if(current.trim()) result.push(current);
 return result;
}
