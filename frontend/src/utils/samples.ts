export interface CodeSample {
  name: string;
  language: string;
  description: string;
  code: string;
}

export const SAMPLES: Record<string, CodeSample> = {
  python: {
    name: "Python (Standard Test Case)",
    language: "python",
    description: "Contains unused imports (math, os), dead code, unused variable, and duplicate logic.",
    code: `import math
import os

def calculate_total(a, b):
    unused_variable = 100
    result = a + b
    return result
    print("This is unreachable")

def repeated_function():
    x = 10
    y = 20
    return x + y

def another_function():
    x = 10
    y = 20
    return x + y
`
  },
  javascript: {
    name: "JavaScript / TypeScript",
    language: "javascript",
    description: "Contains unused imports, unused const, dead statement after return, redundant boolean check, and traditional for-loop.",
    code: `import lodash from 'lodash';
import { useState, useEffect, useMemo } from 'react';

function processUserData(user, isActive) {
  const unusedToken = "xyz-987654";
  
  if (isActive === true) {
    const status = "Active Account";
    return status;
    console.log("Dead code: cannot reach this log");
  }

  // Duplicate Block 1
  const sanitizedName = user.name.trim().toLowerCase();
  const emailDomain = user.email.split("@")[1];
  const auditKey = sanitizedName + ":" + emailDomain;

  return auditKey;
}

function archiveUserData(user) {
  // Duplicate Block 2 (identical logic as above)
  const sanitizedName = user.name.trim().toLowerCase();
  const emailDomain = user.email.split("@")[1];
  const auditKey = sanitizedName + ":" + emailDomain;

  return "ARCHIVED_" + auditKey;
}
`
  },
  java: {
    name: "Java Service Class",
    language: "java",
    description: "Contains unused java.util imports, unused local variable, unreachable statement, and string concatenation in loop.",
    code: `package com.example.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Date;

public class OrderProcessor {

    public String formatSummary(String orderId, int itemCount) {
        int tempBuffer = 4096;
        String status = "PROCESSED";
        
        return "Order #" + orderId + " - Status: " + status;
        System.out.println("Unreachable order audit log");
    }

    public void processTags(String[] tags) {
        String combined = "";
        for (int i = 0; i < tags.length; i++) {
            combined += tags[i] + ",";
        }
    }

    public void duplicateHandlerA(int x) {
        int a = 100;
        int b = 200;
        int sum = a + b + x;
        System.out.println("Sum is: " + sum);
    }

    public void duplicateHandlerB(int x) {
        int a = 100;
        int b = 200;
        int sum = a + b + x;
        System.out.println("Sum is: " + sum);
    }
}
`
  },
  cpp: {
    name: "C++ Data Processor",
    language: "cpp",
    description: "Contains unused vector header, dead code after return, duplicate calculation routines, and endl flushing in loop.",
    code: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int computeMetrics(int a, int b) {
    int unusedMetric = 999;
    int total = a * 2 + b * 3;
    return total;
    cout << "Unreachable calculation debug line" << endl;
}

void printLogs(int iterations) {
    for (int i = 0; i < iterations; i++) {
        cout << "Iteration: " << i << endl;
    }
}

void blockAlpha() {
    int offset = 50;
    int scale = 2;
    int adjusted = offset * scale + 10;
    cout << "Adjusted: " << adjusted << "\n";
}

void blockBeta() {
    int offset = 50;
    int scale = 2;
    int adjusted = offset * scale + 10;
    cout << "Adjusted: " << adjusted << "\n";
}
`
  }
};
