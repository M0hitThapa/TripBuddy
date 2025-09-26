import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateTripDetail=mutation({
    args:{
        tripId:v.string(),
        uid:v.id('userTable'),
        tripDetail:v.any()
    },
    handler:async(ctx, args) => {
        const result = await ctx.db.insert('TripDetailTable', {
            tripDetail:args.tripDetail,
            tripId:args.tripId,
            uid:args.uid
        })
        return result
    }
})

export const ListTripsByUser = query({
  args: { uid: v.id('userTable') },
  handler: async (ctx, args) => {
    const trips = await ctx.db
      .query('TripDetailTable')
      .filter((q) => q.eq(q.field('uid'), args.uid))
      .order('desc')
      .collect()
    return trips
  }
})

export const GetTrip = query({
  args: { id: v.id('TripDetailTable') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  }
})

export const UpdateTripDetail = mutation({
  args: {
    id: v.id('TripDetailTable'),
    tripDetail: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { tripDetail: args.tripDetail })
    return args.id
  }
})

export const DeleteTrip = mutation({
  args: { id: v.id('TripDetailTable') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  }
})