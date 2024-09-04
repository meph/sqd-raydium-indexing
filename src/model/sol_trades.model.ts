import {BigIntColumn, DateTimeColumn, Entity, IntColumn, PrimaryColumn, StringColumn, Column, Index, BooleanColumn, FloatColumn} from '@subsquid/typeorm-store'

@Entity('sol_trades_source')
@Index('idx_sol_trades_1', ['mint', 'timestamp'])
@Index('idx_sol_trades_2', ['timestamp'])
@Index('idx_sol_trades_3', ['mint'])
export class SolTrade {

    constructor(props?: Partial<SolTrade>) {
        Object.assign(this, props)
    }


  @PrimaryColumn()
  id!: string;

  @Column('int4',{ nullable: false })
  bucket!: number;

  @Column('varchar',{ length: 50, nullable: true })
  trader!: string;

  @Column('varchar',{ length: 50, nullable: true })
  mint!: string;

  @Column('timestamp without time zone',{ nullable: true })
  timestamp!: Date;

  @Column('float8', { nullable: true })
  token_delta!: number;

  @Column('float8', { nullable: true })
  sol_delta!: number;

  @Column('int8', { nullable: true })
  fee!: number;

  @DateTimeColumn({ nullable: true })
  created_at!: Date;
}
