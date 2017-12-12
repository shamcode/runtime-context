// Core
const RUNTIME_CONTEXTS = [];

const METADATA = new WeakMap();

export const runtime = {
    hasInstanceOf( context ) {
        return undefined !== RUNTIME_CONTEXTS.find( i => i instanceof context );
    },
    has( context ) {
        return undefined !== RUNTIME_CONTEXTS.find( i => {
                return Object.is( i, context )
            } );
    },
    push() {
        RUNTIME_CONTEXTS.push.apply( RUNTIME_CONTEXTS, arguments );
    },
    pop() {
        return RUNTIME_CONTEXTS.pop();
    }
}

export function runInContext( context, callback ) {
    const contexts = Array.isArray( context ) ? context : [ context ];
    runtime.push.apply( runtime, contexts );

    const result = callback();

    let i = contexts.length;
    while ( i-- ) {
        runtime.pop();
    }

    return result;
}

export function injectContext( target ) {
    return class extends target {
        constructor() {
            super( ...arguments );

            const meta = METADATA.get( target.prototype );

            const prototype = Object.getPrototypeOf( this );
            const reserved = [
                'constructor'
            ]
            Object.getOwnPropertyNames( prototype ).forEach( propName => {
                if ( -1 !== reserved.indexOf( propName ) ) {
                    return;
                }
                if ( -1 !== meta.protected.indexOf( propName ) ) {
                    return;
                }
                if ( -1 !== meta.private.indexOf( propName ) ) {
                    return;
                }
                const descriptor = Object.getOwnPropertyDescriptor( prototype, propName );
                Object.defineProperty( prototype, propName, {
                    value() {
                        return runInContext(
                            [ this ],
                            () => descriptor.value.call( this )
                        )
                    }
                } )
            } );

            Object.getOwnPropertyNames( target.prototype ).forEach( propName => {
                if ( -1 !== reserved.indexOf( propName ) ) {
                    return;
                }
                if ( -1 !== meta.protected.indexOf( propName ) ) {
                    return;
                }
                if ( -1 !== meta.private.indexOf( propName ) ) {
                    return;
                }
                const descriptor = Object.getOwnPropertyDescriptor( target.prototype, propName );
                Object.defineProperty( target.prototype, propName, {
                    value() {
                        return runInContext(
                            [ target, this ],
                            () => descriptor.value.call( this )
                        )
                    }
                } )
            } );
        }
    };
}

export function _protected( target, name, descriptor ) {
    if ( !METADATA.has( target ) ) {
        METADATA.set( target, {
            protected: [],
            private: []
        } );
    }
    const meta = METADATA.get( target );
    meta.protected.push( name )

    const originalValue = descriptor.value;
    descriptor.value = function() {
        if ( !runtime.hasInstanceOf( target.constructor ) ) {
            throw new Error( `${target.constructor.name}.${name} is protected!` );
        }
        return originalValue.call( this );
    }
    return descriptor;
}

export function _private( target, name, descriptor ) {
    if ( !METADATA.has( target ) ) {
        METADATA.set( target, {
            protected: [],
            private: []
        } );
    }
    const meta = METADATA.get( target );
    meta.private.push( name )

    const originalValue = descriptor.value;
    descriptor.value = function() {
        if ( !runtime.has( target.constructor ) ) {
            throw new Error( `${target.constructor.name}.${name} is private!` );
        }
        return originalValue.call( this );
    }
    return descriptor;
}




