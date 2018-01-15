describe( 'Classic OOP', () => {

    it( 'implement abstract method', () => {
        class Man {
            drink() {
                throw new Error( 'Man.drink() is abstract!' );
            }
        }

        class Worker extends Man {
            drink() {
                return 'Coffee';
            }
        }

        class BarClient extends Man {
            drink() {
                return 'Beer';
            }
        }

        const worker = new Worker();
        expect( worker.drink() ).toBe( 'Coffee' );

        const barClient = new BarClient();
        expect( barClient.drink() ).toBe( 'Beer' );
    } );
} );