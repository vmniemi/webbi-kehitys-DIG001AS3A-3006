echo "Havaitut kielet:"
find . -type f -name "*.py" | grep -q . && echo "- Python"
find . -type f -name "*.java" | grep -q . && echo "- Java"
find . -type f -name "*.ts" | grep -q . && echo "- TypeScript"
find . -type f -name "*.js" | grep -q . && echo "- JavaScript"
find . -type f -name "*.c" | grep -q . && echo "- C"
find . -type f -name "*.cpp" | grep -q . && echo "- C++"
find . -type f -name "*.cs" | grep -q . && echo "- C#"
find . -type f -name "*.rb" | grep -q . && echo "- Ruby"
find . -type f -name "*.go" | grep -q . && echo "- Go"
find . -type f -name "*.php" | grep -q . && echo "- PHP"

echo "Myös havaittu:"
find . -type f -name "*.css" | grep -q . && echo "- CSS"
find . -type f -name "*.html" | grep -q . && echo "- HTML"



echo "Löydetyt suunnittelumallit:" > analysis_report.md
grep -R "getInstance" -n . && echo "- Singleton" >> analysis_report.md
grep -R "create[A-Z]" -n . && echo "- Factory Method" >> analysis_report.md
grep -R "notify" -n . && echo "- Observer" >> analysis_report.md
grep -R "Strategy" -n . && echo "- Strategy" >> analysis_report.md
grep -R "Decorator" -n . && echo "- Decorator" >> analysis_report.md