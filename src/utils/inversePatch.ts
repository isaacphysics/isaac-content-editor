import {
    AddOperation,
    MoveOperation,
    Operation,
    RemoveOperation,
    ReplaceOperation,
    TestOperation
} from "fast-json-patch";

// Adapted from https://github.com/cujojs/jiff

const inverses = {
    test: invertTest,
    add: invertAdd,
    replace: invertReplace,
    remove: invertRemove,
    move: invertMove,
    // copy: ???
    // See https://github.com/cujojs/jiff/issues/9
    // This needs more thought. We may have to extend/amend JSON Patch.
    // At first glance, this seems like it should just be a remove.
    // However, that's not correct.  It violates the involution:
    // invert(invert(p)) ~= p.  For example:
    // invert(copy) -> remove
    // invert(remove) -> add (DOH! this should be copy!)
};

function isInvertibleOperation(op: string): op is keyof typeof inverses {
    return Object.keys(inverses).includes(op);
}

export function invertJSONPatch(patch: Operation[]) {
    const inversePatch: Operation[] = [];
    let skip = 0;
    
    // Iterate backwards through the patch operations, inverting each type of patch with the 
    for(let i = patch.length - 1; i >= 0; i -= skip) {
        const opType = patch[i].op;
        if(isInvertibleOperation(opType)) {
            skip = inverses[opType](inversePatch, patch[i] as any, i, patch);
        } else {
            throw Error(`Inverse patch cannot be computed: inversion is not implemented for operations of type: ${opType}`);
        }
    }
    return inversePatch;
}

function invertTest(inversePatch: Operation[], testOp: TestOperation<any>) {
    inversePatch.push(testOp);
    return 1;
}

function invertAdd(inversePatch: Operation[], addOp: AddOperation<any>) {
    inversePatch.push({
        op: 'test',
        path: addOp.path,
        value: addOp.value
    }, {
        op: 'remove',
        path: addOp.path
    });
    return 1;
}

function invertReplace(inversePatch: Operation[], replaceOp: ReplaceOperation<any>, i: number, patch: Operation[]) {
    const prevOp = patch[i-1];
    if(prevOp === void 0 || prevOp.op !== 'test' || prevOp.path !== replaceOp.path) {
        throw new Error('cannot invert replace w/o test');
    }
    inversePatch.push({
        op: 'test',
        path: prevOp.path,
        value: replaceOp.value
    }, {
        op: 'replace',
        path: prevOp.path,
        value: prevOp.value
    });
    return 2;
}

function invertRemove(inversePatch: Operation[], removeOp: RemoveOperation, i: number, patch: Operation[]) {
    const prevOp = patch[i-1];
    if (prevOp === void 0 || prevOp.op !== 'test' || prevOp.path !== removeOp.path) {
        throw new Error('cannot invert remove w/o test');
    }

    inversePatch.push({
        op: 'add',
        path: prevOp.path,
        value: prevOp.value
    });

    return 2;
}

function invertMove(inversePatch: Operation[], moveOp: MoveOperation) {
    inversePatch.push({
        op: 'move',
        path: moveOp.from,
        from: moveOp.path
    });
    return 1;
}
