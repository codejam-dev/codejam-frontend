/**
 * Language Templates and Configurations
 */

import { LanguageConfig, SupportedLanguage } from '@/types/playground.types';
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiCplusplus,
  SiC,
  SiGo,
  SiRust
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';

export const LANGUAGE_TEMPLATES: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    monacoLanguage: 'javascript',
    extension: '.js',
    icon: SiJavascript,
    iconColor: '#F7DF1E',
    defaultCode: `// JavaScript Playground
console.log("Hello, CodeJam!");

// Your code here
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));
`,
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    monacoLanguage: 'typescript',
    extension: '.ts',
    icon: SiTypescript,
    iconColor: '#3178C6',
    defaultCode: `// TypeScript Playground
console.log("Hello, CodeJam!");

// Your code here
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));

interface Person {
  name: string;
  age: number;
}

const person: Person = {
  name: "Alice",
  age: 30,
};

console.log(\`\${person.name} is \${person.age} years old.\`);
`,
  },
  python: {
    id: 'python',
    name: 'Python',
    monacoLanguage: 'python',
    extension: '.py',
    icon: SiPython,
    iconColor: '#3776AB',
    defaultCode: `# Python Playground
print("Hello, CodeJam!")

# Your code here
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"Fibonacci(10): {fibonacci(10)}")

# List comprehension example
squares = [x**2 for x in range(10)]
print(f"Squares: {squares}")
`,
  },
  java: {
    id: 'java',
    name: 'Java',
    monacoLanguage: 'java',
    extension: '.java',
    icon: FaJava,
    iconColor: '#007396',
    defaultCode: `// Java Playground
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeJam!");

        // Your code here
        int result = fibonacci(10);
        System.out.println("Fibonacci(10): " + result);
    }

    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}
`,
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    monacoLanguage: 'cpp',
    extension: '.cpp',
    icon: SiCplusplus,
    iconColor: '#00599C',
    defaultCode: `// C++ Playground
#include <iostream>
#include <vector>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Hello, CodeJam!" << endl;

    // Your code here
    cout << "Fibonacci(10): " << fibonacci(10) << endl;

    // Vector example
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Numbers: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;

    return 0;
}
`,
  },
  c: {
    id: 'c',
    name: 'C',
    monacoLanguage: 'c',
    extension: '.c',
    icon: SiC,
    iconColor: '#A8B9CC',
    defaultCode: `// C Playground
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("Hello, CodeJam!\\n");

    // Your code here
    printf("Fibonacci(10): %d\\n", fibonacci(10));

    // Array example
    int numbers[] = {1, 2, 3, 4, 5};
    int size = sizeof(numbers) / sizeof(numbers[0]);

    printf("Numbers: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");

    return 0;
}
`,
  },
  go: {
    id: 'go',
    name: 'Go',
    monacoLanguage: 'go',
    extension: '.go',
    icon: SiGo,
    iconColor: '#00ADD8',
    defaultCode: `// Go Playground
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println("Hello, CodeJam!")

    // Your code here
    fmt.Printf("Fibonacci(10): %d\\n", fibonacci(10))

    // Slice example
    numbers := []int{1, 2, 3, 4, 5}
    fmt.Printf("Numbers: %v\\n", numbers)
}
`,
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    monacoLanguage: 'rust',
    extension: '.rs',
    icon: SiRust,
    iconColor: '#CE422B',
    defaultCode: `// Rust Playground
fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    fibonacci(n - 1) + fibonacci(n - 2)
}

fn main() {
    println!("Hello, CodeJam!");

    // Your code here
    println!("Fibonacci(10): {}", fibonacci(10));

    // Vector example
    let numbers: Vec<i32> = vec![1, 2, 3, 4, 5];
    println!("Numbers: {:?}", numbers);

    // Iterator example
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
`,
  },
};

export const DEFAULT_EDITOR_SETTINGS = {
  fontSize: 14,
  tabSize: 2,
  minimap: true,
  lineNumbers: true,
  wordWrap: false,
  theme: 'vs-dark' as const,
};

export const SUPPORTED_LANGUAGES = Object.keys(
  LANGUAGE_TEMPLATES
) as SupportedLanguage[];

export const getLanguageConfig = (
  language: SupportedLanguage
): LanguageConfig => {
  return LANGUAGE_TEMPLATES[language];
};

export const getDefaultCode = (language: SupportedLanguage): string => {
  return LANGUAGE_TEMPLATES[language].defaultCode;
};
