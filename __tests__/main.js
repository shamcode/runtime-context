import { _private, _protected, injectContext, runInContext } from '../src/index';

// Test contexts
class Context {

}

@injectContext
class Foo {
    constructor( processCallback, printCallback ) {
        this.processCallback = processCallback;
        this.printCallback = printCallback;
    }

    @_protected process() {
        this.processCallback();
    }

    @_private print() {
        this.printCallback();
    }

    publicMethod() {
        this.print();
    }

    publicForProcess() {
        this.process();
    }
}


class Bar extends Foo {
    processFile() {

        // Correct
        this.process();
    }

    publicMethod2() {
        this.print();
    }
}

it( 'bar.processFile()', () => {
    runInContext( Context, () => {
        const processMock = jest.fn();
        const bar = new Bar( processMock );
        bar.processFile();
        expect( processMock.mock.calls.length ).toBe( 1 );
    } );
} );

it( 'bar.process()', () => {
    runInContext( Context, () => {
        const processMock = jest.fn();
        const bar = new Bar( processMock );
        try {
            bar.process();
        } catch ( e ) {
            expect( e.message ).toBe( 'Foo.process is protected!' );
        }
        expect( processMock.mock.calls.length ).toBe( 0 );
    } );
} );

//
//runInContext( Context, () => {
//    displayResult( '====Bar===' );
//    const bar = new Bar;
//
//    displayResult( '====Foo====' );
//    const foo = new Foo;
//    displayResult( 'Expected:  Foo.print called' );
//    foo.publicMethod(); // Correct
//    displayResult( 'Expected:  Foo.process is protected' );
//    try {
//        foo.process(); // Error
//    } catch ( e ) {
//        displayResult( e.message );
//    }
//    displayResult( 'Expected:  Foo.process called' );
//    foo.publicForProcess(); // Correct
//
//    displayResult( '====Bar====' );
//    displayResult( 'Expected:  Foo.print is private' );
//    try {
//        bar.print(); // Error
//    } catch ( e ) {
//        displayResult( e.message );
//    }
//    displayResult( 'Expected:  Foo.print called' );
//    bar.publicMethod(); // Correct
//    displayResult( 'Expected:  Foo.print is private' );
//    try {
//        bar.publicMethod2(); // Error
//    } catch ( e ) {
//        displayResult( e.message );
//    }
//} )