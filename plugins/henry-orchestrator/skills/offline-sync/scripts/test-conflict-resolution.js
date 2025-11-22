#!/usr/bin/env node

/**
 * Test Conflict Resolution
 *
 * This script tests various conflict resolution scenarios
 * to ensure your sync implementation handles conflicts correctly.
 */

class ConflictTester {
  constructor(resolveFunction) {
    this.resolveFunction = resolveFunction;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * Add a test case
   */
  addTest(name, local, remote, expected) {
    this.tests.push({ name, local, remote, expected });
  }

  /**
   * Run all tests
   */
  async runTests() {
    console.log('=== Conflict Resolution Tests ===\n');

    for (const test of this.tests) {
      await this.runTest(test);
    }

    this.printSummary();

    return {
      passed: this.passed,
      failed: this.failed,
      total: this.tests.length,
    };
  }

  /**
   * Run a single test
   */
  async runTest(test) {
    console.log(`Testing: ${test.name}`);

    try {
      const result = await this.resolveFunction(test.local, test.remote);

      // Deep compare result with expected
      if (JSON.stringify(result) === JSON.stringify(test.expected)) {
        console.log('  ✅ PASSED\n');
        this.passed++;
      } else {
        console.log('  ❌ FAILED');
        console.log('    Expected:', JSON.stringify(test.expected, null, 2));
        console.log('    Got:     ', JSON.stringify(result, null, 2));
        console.log('');
        this.failed++;
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message);
      console.log('');
      this.failed++;
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('=== Test Summary ===');
    console.log(`Total: ${this.tests.length}`);
    console.log(`Passed: ${this.passed} ✅`);
    console.log(`Failed: ${this.failed} ❌`);
    console.log('');

    if (this.failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(`⚠️  ${this.failed} test(s) failed`);
    }
  }
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

/**
 * Test Last-Write-Wins conflict resolution
 */
function testLWW() {
  console.log('Testing Last-Write-Wins (LWW)\n');

  function resolveLWW(local, remote) {
    if (remote.updated_at > local.updated_at) {
      return { ...remote, resolution: 'remote' };
    } else {
      return { ...local, resolution: 'local' };
    }
  }

  const tester = new ConflictTester(resolveLWW);

  // Test 1: Remote newer
  tester.addTest(
    'Remote is newer',
    { id: '1', title: 'Local', updated_at: 1000 },
    { id: '1', title: 'Remote', updated_at: 2000 },
    { id: '1', title: 'Remote', updated_at: 2000, resolution: 'remote' }
  );

  // Test 2: Local newer
  tester.addTest(
    'Local is newer',
    { id: '1', title: 'Local', updated_at: 2000 },
    { id: '1', title: 'Remote', updated_at: 1000 },
    { id: '1', title: 'Local', updated_at: 2000, resolution: 'local' }
  );

  // Test 3: Same timestamp (local wins)
  tester.addTest(
    'Same timestamp',
    { id: '1', title: 'Local', updated_at: 1000 },
    { id: '1', title: 'Remote', updated_at: 1000 },
    { id: '1', title: 'Local', updated_at: 1000, resolution: 'local' }
  );

  return tester.runTests();
}

/**
 * Test Version-based conflict resolution
 */
function testVersionBased() {
  console.log('Testing Version-Based Resolution\n');

  function resolveVersion(local, remote) {
    if (remote.version > local.version) {
      return { ...remote, resolution: 'remote' };
    } else if (local.version > remote.version) {
      return { ...local, resolution: 'local' };
    } else {
      // Same version, use timestamp
      if (remote.updated_at > local.updated_at) {
        return { ...remote, resolution: 'remote' };
      } else {
        return { ...local, resolution: 'local' };
      }
    }
  }

  const tester = new ConflictTester(resolveVersion);

  // Test 1: Remote has higher version
  tester.addTest(
    'Remote higher version',
    { id: '1', title: 'Local', version: 2, updated_at: 2000 },
    { id: '1', title: 'Remote', version: 3, updated_at: 1000 },
    { id: '1', title: 'Remote', version: 3, updated_at: 1000, resolution: 'remote' }
  );

  // Test 2: Local has higher version
  tester.addTest(
    'Local higher version',
    { id: '1', title: 'Local', version: 5, updated_at: 1000 },
    { id: '1', title: 'Remote', version: 3, updated_at: 2000 },
    { id: '1', title: 'Local', version: 5, updated_at: 1000, resolution: 'local' }
  );

  // Test 3: Same version, use timestamp
  tester.addTest(
    'Same version, remote newer',
    { id: '1', title: 'Local', version: 3, updated_at: 1000 },
    { id: '1', title: 'Remote', version: 3, updated_at: 2000 },
    { id: '1', title: 'Remote', version: 3, updated_at: 2000, resolution: 'remote' }
  );

  return tester.runTests();
}

/**
 * Test Field-level merge
 */
function testFieldMerge() {
  console.log('Testing Field-Level Merge\n');

  function resolveFieldMerge(local, remote) {
    return {
      id: local.id,
      // Title: use newer
      title: remote.title_updated_at > local.title_updated_at ? remote.title : local.title,
      title_updated_at: Math.max(local.title_updated_at, remote.title_updated_at),
      // Description: prefer non-empty
      description: remote.description || local.description,
      // Status: use newer
      status: remote.status_updated_at > local.status_updated_at ? remote.status : local.status,
      status_updated_at: Math.max(local.status_updated_at, remote.status_updated_at),
      updated_at: Math.max(local.updated_at, remote.updated_at),
      resolution: 'merged',
    };
  }

  const tester = new ConflictTester(resolveFieldMerge);

  // Test 1: Different fields updated
  tester.addTest(
    'Different fields updated',
    {
      id: '1',
      title: 'Local Title',
      title_updated_at: 2000,
      description: 'Local Desc',
      status: 'pending',
      status_updated_at: 1000,
      updated_at: 2000,
    },
    {
      id: '1',
      title: 'Remote Title',
      title_updated_at: 1000,
      description: '',
      status: 'done',
      status_updated_at: 3000,
      updated_at: 3000,
    },
    {
      id: '1',
      title: 'Local Title',
      title_updated_at: 2000,
      description: 'Local Desc',
      status: 'done',
      status_updated_at: 3000,
      updated_at: 3000,
      resolution: 'merged',
    }
  );

  return tester.runTests();
}

/**
 * Test Semantic merge (state machine)
 */
function testSemanticMerge() {
  console.log('Testing Semantic Merge\n');

  const statusPriority = {
    pending: 1,
    in_progress: 2,
    review: 3,
    done: 4,
    archived: 5,
  };

  function resolveSemanticMerge(local, remote) {
    // Always move to higher priority status
    const status =
      statusPriority[local.status] > statusPriority[remote.status] ? local.status : remote.status;

    return {
      id: local.id,
      title: remote.updated_at > local.updated_at ? remote.title : local.title,
      status,
      updated_at: Math.max(local.updated_at, remote.updated_at),
      resolution: 'semantic',
    };
  }

  const tester = new ConflictTester(resolveSemanticMerge);

  // Test 1: Local has higher priority status
  tester.addTest(
    'Local status has higher priority',
    { id: '1', title: 'Task', status: 'done', updated_at: 1000 },
    { id: '1', title: 'Task', status: 'in_progress', updated_at: 2000 },
    { id: '1', title: 'Task', status: 'done', updated_at: 2000, resolution: 'semantic' }
  );

  // Test 2: Remote has higher priority status
  tester.addTest(
    'Remote status has higher priority',
    { id: '1', title: 'Task', status: 'pending', updated_at: 2000 },
    { id: '1', title: 'Task', status: 'archived', updated_at: 1000 },
    { id: '1', title: 'Task', status: 'archived', updated_at: 2000, resolution: 'semantic' }
  );

  return tester.runTests();
}

/**
 * Test delete-update conflicts
 */
function testDeleteUpdateConflict() {
  console.log('Testing Delete-Update Conflicts\n');

  function resolveDeleteUpdate(local, remote) {
    // If either is deleted, mark as deleted
    if (local.deleted_at || remote.deleted_at) {
      return {
        ...local,
        ...remote,
        deleted_at: local.deleted_at || remote.deleted_at,
        resolution: 'deleted',
      };
    }

    // Otherwise use LWW
    if (remote.updated_at > local.updated_at) {
      return { ...remote, resolution: 'remote' };
    } else {
      return { ...local, resolution: 'local' };
    }
  }

  const tester = new ConflictTester(resolveDeleteUpdate);

  // Test 1: Local deleted, remote updated
  tester.addTest(
    'Local deleted, remote updated',
    { id: '1', title: 'Task', updated_at: 2000, deleted_at: 2000 },
    { id: '1', title: 'Updated Task', updated_at: 1000, deleted_at: null },
    { id: '1', title: 'Updated Task', updated_at: 1000, deleted_at: 2000, resolution: 'deleted' }
  );

  // Test 2: Remote deleted, local updated
  tester.addTest(
    'Remote deleted, local updated',
    { id: '1', title: 'Updated Task', updated_at: 2000, deleted_at: null },
    { id: '1', title: 'Task', updated_at: 1000, deleted_at: 1000 },
    { id: '1', title: 'Updated Task', updated_at: 2000, deleted_at: 1000, resolution: 'deleted' }
  );

  // Test 3: Both deleted
  tester.addTest(
    'Both deleted',
    { id: '1', title: 'Task', updated_at: 2000, deleted_at: 2000 },
    { id: '1', title: 'Task', updated_at: 1500, deleted_at: 1500 },
    { id: '1', title: 'Task', updated_at: 2000, deleted_at: 2000, resolution: 'deleted' }
  );

  return tester.runTests();
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Conflict Resolution Test Suite       ║');
  console.log('╚════════════════════════════════════════╝\n');

  const results = [];

  results.push(await testLWW());
  results.push(await testVersionBased());
  results.push(await testFieldMerge());
  results.push(await testSemanticMerge());
  results.push(await testDeleteUpdateConflict());

  // Overall summary
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Overall Summary                       ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${totalPassed} ✅`);
  console.log(`Failed: ${totalFailed} ❌`);
  console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%\n`);

  return {
    totalTests,
    totalPassed,
    totalFailed,
    successRate: (totalPassed / totalTests) * 100,
  };
}

// CLI usage
if (require.main === module) {
  runAllTests().then(result => {
    process.exit(result.totalFailed === 0 ? 0 : 1);
  });
}

module.exports = {
  ConflictTester,
  runAllTests,
  testLWW,
  testVersionBased,
  testFieldMerge,
  testSemanticMerge,
  testDeleteUpdateConflict,
};
